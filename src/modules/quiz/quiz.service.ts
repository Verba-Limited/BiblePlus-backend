import axios from "axios";
import AppError from "../../core/AppError";
import { QuizQuestion } from "./quizQuestion.model";
import { QuizAttempt } from "./quizAttempt.model";
import { QuizProgress } from "./quizProgress.model";
import mongoose from "mongoose";

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

/* =====================================================
   DIFFICULTY + XP MULTIPLIER
===================================================== */
const difficultyByLevel = (level: number) => {
  if (level <= 3) return { difficulty: "easy", multiplier: 10 };
  if (level <= 6) return { difficulty: "medium", multiplier: 15 };
  if (level <= 9) return { difficulty: "hard", multiplier: 25 };
  return { difficulty: "expert", multiplier: 40 };
};

/* =====================================================
   LEVEL CALCULATION FROM XP
===================================================== */
const calculateLevelFromXp = (xp: number) => {
  return Math.floor(xp / 500) + 1;
};

/* =====================================================
   WEEK KEY HELPER
===================================================== */
const getCurrentWeekKey = () => {
  const now = new Date();
  const firstJan = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor(
    (now.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000)
  );
  const week = Math.ceil((days + firstJan.getDay() + 1) / 7);
  return `${now.getFullYear()}-W${week}`;
};

/* =====================================================
   GENERATE AI QUESTIONS
===================================================== */
const generateQuestionsFromAI = async (level: number) => {
  if (!OPENAI_API_KEY) {
    throw new AppError("OpenAI API missing", 500);
  }

  const { difficulty } = difficultyByLevel(level);

  const prompt = `
Generate 10 Bible quiz questions.
Difficulty: ${difficulty}.
Level: ${level}.
Each question must include:
- question
- options (4)
- correctAnswer
Return ONLY valid JSON array.
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

  try {
    return JSON.parse(raw);
  } catch {
    throw new AppError("AI returned invalid JSON", 500);
  }
};

/* =====================================================
   QUIZ SERVICE
===================================================== */
export const QuizService = {

  /* =====================================================
     PLAY
  ===================================================== */
  async play(userId: string, level: number) {
    if (!level || level < 1) {
      throw new AppError("Invalid level", 400);
    }

    const progress =
      (await QuizProgress.findOne({ userId })) ||
      (await QuizProgress.create({ userId }));

    if (level > progress.highestLevel) {
      throw new AppError("Level locked", 403);
    }

    // ✅ Randomly sample up to 10 questions for this level (both admin and ai)
    let questions = await QuizQuestion.aggregate([
      { $match: { level, active: true } },
      { $sample: { size: 10 } }
    ]);

    if (questions.length < 10) {
      try {
        const aiQuestions = await generateQuestionsFromAI(level);

        const created = await QuizQuestion.insertMany(
          aiQuestions.map((q: any) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            level,
            difficulty: difficultyByLevel(level).difficulty,
            source: "ai",
            active: true
          }))
        );

        // ✅ Combine existing questions with new AI questions to reach 10
        const needed = 10 - questions.length;
        const newQuestions = created.slice(0, needed).map(doc => doc.toObject());
        questions = [...questions, ...newQuestions];
      } catch (err) {
        console.log("AI failed. Using available admin questions.");
        if (!questions.length) {
          throw new AppError("No questions available for this level", 500);
        }
      }
    }

    return questions.map((q: any) => ({
      _id: q._id,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer
    }));
  },

  /* =====================================================
     SUBMIT QUIZ
  ===================================================== */
 async submit(userId: string, level: number, answers: any[]) {
  if (!answers?.length) {
    throw new AppError("Answers required", 400);
  }

  const questions = await QuizQuestion.find({
    _id: { $in: answers.map(a => a.questionId) }
  });

  let correct = 0;
  for (const ans of answers) {
    const q = questions.find(q => q._id.toString() === ans.questionId);
    if (q && q.correctAnswer === ans.answer) correct++;
  }

  const total = questions.length;
  const score = Math.round((correct / total) * 100);

  await QuizAttempt.create({ userId, level, score, correct, total });

  const { multiplier } = difficultyByLevel(level);
  const earnedXp = correct * multiplier;
  const currentWeek = getCurrentWeekKey();

  let progress = await QuizProgress.findOne({ userId });

  if (!progress) {
    progress = await QuizProgress.create({
      userId,
      highestLevel: score >= 70 ? level + 1 : 1, // ✅ unlock immediately on create
      totalXp: earnedXp,
      totalCorrect: correct,
      totalAttempts: 1,
      weeklyXp: earnedXp,
      weeklyCorrect: correct,
      weeklyAttempts: 1,
      lastWeeklyReset: currentWeek
    });
  } else {
    // ✅ Weekly reset check
    if (progress.lastWeeklyReset !== currentWeek) {
      progress.weeklyXp = 0;
      progress.weeklyCorrect = 0;
      progress.weeklyAttempts = 0;
      progress.lastWeeklyReset = currentWeek;
    }

    // ✅ Global stats
    progress.totalXp += earnedXp;
    progress.totalCorrect += correct;
    progress.totalAttempts += 1;

    // ✅ Weekly stats
    progress.weeklyXp += earnedXp;
    progress.weeklyCorrect += correct;
    progress.weeklyAttempts += 1;

    // ✅ Unlock next level in same save — no separate findOneAndUpdate needed
    if (score >= 70) {
      progress.highestLevel = Math.max(progress.highestLevel, level + 1);
    }

    // ✅ Also bump level from XP
    progress.highestLevel = Math.max(
      progress.highestLevel,
      calculateLevelFromXp(progress.totalXp)
    );

    await progress.save();
  }

  // ✅ Log BEFORE return so it actually runs
  console.log("✅ Progress after submit:", {
    userId,
    totalXp: progress.totalXp,
    weeklyXp: progress.weeklyXp,
    totalCorrect: progress.totalCorrect,
    highestLevel: progress.highestLevel
  });

  return {
    score,
    correct,
    total,
    earnedXp,
    totalXp: progress.totalXp,
    weeklyXp: progress.weeklyXp,
    userLevel: calculateLevelFromXp(progress.totalXp),
    unlockedNextLevel: score >= 70,
    correctAnswers: questions.map(q => q.correctAnswer)
  };
},

  /* =====================================================
     COMPLETE LEVEL
  ===================================================== */
  async completeLevel(
    userId: string,
    level: number,
    mode: string,
    score: number
  ) {
    if (!level || !score) {
      throw new AppError("Level and score are required", 400);
    }

    if (score < 70) {
      return { userId, level, mode, score, completed: false, nextLevelUnlocked: null };
    }

    let progress = await QuizProgress.findOne({ userId });

    if (!progress) {
      progress = await QuizProgress.create({ userId, highestLevel: 1 });
    }

    const nextLevel = level + 1;

    if (nextLevel > progress.highestLevel) {
      progress.highestLevel = nextLevel;
      await progress.save();
    }

    return { userId, level, mode, score, completed: true, nextLevelUnlocked: nextLevel };
  }
};