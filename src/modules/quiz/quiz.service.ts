// src/modules/quiz/quiz.service.ts

import axios from "axios";
import AppError from "../../core/AppError";
import { QuizQuestion } from "./quizQuestion.model";
import { QuizAttempt } from "./quizAttempt.model";
import { QuizProgress } from "./quizProgress.model";
import { UserXp } from "../xp/userXp.model";
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


async play(userId: string, level: number) {
  const progress =
    (await QuizProgress.findOne({ userId })) ||
    (await QuizProgress.create({ userId }));

  if (level > progress.highestLevel) {
    throw new AppError("Level locked", 403);
  }

  let questions = [];

  // 🔥 1. Try OpenAI FIRST
  try {
    const aiQuestions = await generateQuestionsFromAI(level);

    const created = await QuizQuestion.insertMany(
      aiQuestions.map((q: any) => ({
        ...q,
        level,
        difficulty: difficultyByLevel(level).difficulty,
        source: "ai",
        active: true
      }))
    );

    questions = created;
  } catch (err) {
    console.log("AI failed, using manual questions");

    // 🔥 2. Fallback to manual/admin questions
    questions = await QuizQuestion.find({
      level,
      source: "admin",
      active: true
    })
      .limit(10)
      .lean();

    if (!questions.length) {
      throw new AppError(
        "No questions available for this level",
        500
      );
    }
  }

  return questions.map((q: any) => ({
    _id: q._id,
    question: q.question,
    options: q.options
  }));
},

  /* =====================================================
     SUBMIT QUIZ (WITH XP SYSTEM)
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

    /* ===============================
       XP CALCULATION
    =============================== */
    /* ===============================
   XP CALCULATION (GLOBAL + WEEKLY)
================================= */

const { multiplier } = difficultyByLevel(level);
const earnedXp = correct * multiplier;

// Get current week start (Monday 00:00)
const now = new Date();
const startOfWeek = new Date(now);
startOfWeek.setDate(now.getDate() - now.getDay());
startOfWeek.setHours(0, 0, 0, 0);

let xpRecord = await UserXp.findOne({
  user: new mongoose.Types.ObjectId(userId)
});

if (!xpRecord) {
  xpRecord = await UserXp.create({
    user: userId,
    totalXp: earnedXp,
    weeklyXp: earnedXp,
    weeklyCorrect: correct,
    weeklyAttempts: 1,
    lastWeeklyReset: startOfWeek,
    level: calculateLevelFromXp(earnedXp)
  });
} else {

  /* ===============================
     WEEKLY RESET CHECK
  =============================== */

  if (
    !xpRecord.lastWeeklyReset ||
    xpRecord.lastWeeklyReset < startOfWeek
  ) {
    // Reset weekly stats
    xpRecord.weeklyXp = 0;
    xpRecord.weeklyCorrect = 0;
    xpRecord.weeklyAttempts = 0;
    xpRecord.lastWeeklyReset = startOfWeek;
  }

  // GLOBAL
  xpRecord.totalXp += earnedXp;

  // WEEKLY
  xpRecord.weeklyXp += earnedXp;
  xpRecord.weeklyCorrect += correct;
  xpRecord.weeklyAttempts += 1;

  xpRecord.level = calculateLevelFromXp(xpRecord.totalXp);

  await xpRecord.save();
}

    /* ===============================
       UNLOCK NEXT LEVEL
    =============================== */
    if (score >= 70) {
      await QuizProgress.findOneAndUpdate(
        { userId },
        { $max: { highestLevel: level + 1 } }
      );
    }

    return {
  score,
  correct,
  total,
  earnedXp,
  totalXp: xpRecord.totalXp,
  weeklyXp: xpRecord.weeklyXp,
  userLevel: xpRecord.level,
  unlockedNextLevel: score >= 70,
  correctAnswers: questions.map(q => q.correctAnswer)
};
  }
};