// src/modules/quiz/quiz.service.ts

import axios from "axios";
import AppError from "../../core/AppError";
import { QuizQuestion } from "./quizQuestion.model";
import { QuizAttempt } from "./quizAttempt.model";
import { QuizProgress } from "./quizProgress.model";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const difficultyByLevel = (level: number) => {
  if (level <= 3) return "easy";
  if (level <= 6) return "medium";
  if (level <= 9) return "hard";
  return "expert";
};

const generateQuestionsFromAI = async (level: number) => {
  if (!OPENAI_API_KEY) {
    throw new AppError("OpenAI API missing", 500);
  }

  const difficulty = difficultyByLevel(level);

  const prompt = `
Generate 10 Bible quiz questions.
Difficulty: ${difficulty}.
Level: ${level}.
Each question must include:
- question
- options (4)
- correctAnswer
Return ONLY JSON array.
`;

  const res = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You generate Bible quizzes." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    },
    {
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`
      }
    }
  );

  const raw = res.data.choices[0].message.content;
  return JSON.parse(raw);
};

export const QuizService = {
  async play(userId: string, level: number) {
    const progress =
      (await QuizProgress.findOne({ userId })) ||
      (await QuizProgress.create({ userId }));

    if (level > progress.highestLevel) {
      throw new AppError("Level locked", 403);
    }

    let questions = await QuizQuestion.find({
      level,
      active: true
    }).limit(10);

    if (questions.length < 10) {
      const aiQuestions = await generateQuestionsFromAI(level);

      const created = await QuizQuestion.insertMany(
        aiQuestions.map((q: any) => ({
          ...q,
          level,
          difficulty: difficultyByLevel(level),
          source: "ai"
        }))
      );

      questions = created;
    }

    return questions.map(q => ({
      _id: q._id,
      question: q.question,
      options: q.options
    }));
  },

  async submit(userId: string, level: number, answers: any[]) {
    const questions = await QuizQuestion.find({
      _id: { $in: answers.map(a => a.questionId) }
    });

    let correct = 0;

    for (const ans of answers) {
      const q = questions.find(
        q => q._id.toString() === ans.questionId
      );
      if (q && q.correctAnswer === ans.answer) correct++;
    }

    const total = questions.length;
    const score = Math.round((correct / total) * 100);

    await QuizAttempt.create({
      userId,
      level,
      score,
      correct,
      total
    });

    if (score >= 70) {
      await QuizProgress.findOneAndUpdate(
        { userId },
        { $max: { highestLevel: level + 1 } }
      );
    }

    return { score, correct, total };
  }
};