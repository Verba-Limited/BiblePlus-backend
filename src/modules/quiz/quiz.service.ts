// src/modules/quiz/quiz.service.ts
import AppError from "../../core/AppError";
import { QuizQuestion } from "./quizQuestion.model";
import { QuizAttempt } from "./quizAttempt.model";
import { QuizDaily } from "./quizDaily.model";
import { QuizDailyAttempt } from "./quizDailyAttempt";
import { QuizLevelService } from "./quizLevel.service";
import { QuizLeaderboardService } from "./quizLeaderboard.service";

type QuizMode = "normal" | "puzzle";

const getDayKey = (date = new Date()) =>
  date.toISOString().split("T")[0];

export const QuizService = {
  /* =======================================================
     PLAY NORMAL / PUZZLE QUIZ
  ======================================================= */
  async play(mode: QuizMode, level: number) {
    if (!mode || level < 1 || level > 10) {
      throw new AppError("Invalid quiz mode or level", 400);
    }

    const questions = await QuizQuestion.find({
      mode,
      level,
      active: true
    }).limit(10);

    if (!questions.length) {
      throw new AppError("No questions available", 404);
    }

    return {
      mode,
      level,
      timer: 30,
      total: questions.length,
      questions: questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        image: q.image ?? null,

        // ⚠️ TEMP — REMOVE IN PROD
        correctAnswer: q.correctAnswer
      }))
    };
  },

  /* =======================================================
     SUBMIT NORMAL / PUZZLE QUIZ
  ======================================================= */
  async submit(
    userId: string,
    payload: { mode: QuizMode; level: number; answers: any[] }
  ) {
    const { mode, level, answers } = payload;

    if (!answers?.length) {
      throw new AppError("Answers required", 400);
    }

    const questions = await QuizQuestion.find({
      _id: { $in: answers.map(a => a.questionId) }
    });

    let correct = 0;
    for (const a of answers) {
      const q = questions.find(q => q._id.toString() === a.questionId);
      if (q && q.correctAnswer === a.answer) correct++;
    }

    const total = answers.length;
    const score = Math.round((correct / total) * 100);

    await QuizAttempt.create({
      userId,
      mode,
      level,
      score,
      correct,
      total
    });

    // 🔥 NORMAL & PUZZLE LEADERBOARD
    await QuizLeaderboardService.updateFromQuizAttempt({
      userId,
      score,
      correct
    });

    const xpEarned = correct * 10;
    const levelProgress = await QuizLevelService.addXp(userId, xpEarned);

    return {
      score,
      correct,
      total,
      xpEarned,
      levelProgress
    };
  },

  /* =======================================================
     GET TODAY'S DAILY QUIZ
  ======================================================= */
  async dailyToday(userId: string) {
    const today = getDayKey();
    return QuizService.dailyByDate(today, userId);
  },

  /* =======================================================
     GET DAILY QUIZ BY DATE (REAL DATA ONLY)
  ======================================================= */
  async dailyByDate(date: string, userId?: string) {
    if (!date) {
      throw new AppError("Date is required (YYYY-MM-DD)", 400);
    }

    const daily = await QuizDaily.findOne({ date }).lean();
    if (!daily) {
      throw new AppError("No daily quiz for this date", 404);
    }

    if (userId) {
      const alreadyPlayed = await QuizDailyAttempt.findOne({
        userId,
        date
      });

      if (alreadyPlayed) {
        throw new AppError("Daily quiz already completed", 400);
      }
    }

    const questions = await QuizQuestion.find({
      _id: { $in: daily.questions },
      active: true
    });

    return {
      date,
      timer: 30,
      total: questions.length,
      questions: questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        image: q.image ?? null,

        // ⚠️ TEMP — REMOVE IN PROD
        correctAnswer: q.correctAnswer
      }))
    };
  },

  /* =======================================================
     LIST AVAILABLE DAILY QUIZ DATES
     GET /api/quiz/daily/dates
  ======================================================= */
  async dailyDates() {
    const rows = await QuizDaily.find()
      .sort({ date: -1 })
      .select("date questions")
      .lean();

    return rows.map(d => ({
      date: d.date,
      total: d.questions.length
    }));
  },

  /* =======================================================
     SUBMIT DAILY QUIZ
  ======================================================= */
  async submitDaily(params: { userId: string; answers: any[] }) {
    const { userId, answers } = params;
    const date = getDayKey();

    if (!answers?.length) {
      throw new AppError("Answers required", 400);
    }

    const daily = await QuizDaily.findOne({ date });
    if (!daily) {
      throw new AppError("No daily quiz today", 404);
    }

    const existing = await QuizDailyAttempt.findOne({ userId, date });
    if (existing) {
      throw new AppError("Daily quiz already submitted", 400);
    }

    const questions = await QuizQuestion.find({
      _id: { $in: daily.questions }
    });

    let correct = 0;
    for (const a of answers) {
      const q = questions.find(q => q._id.toString() === a.questionId);
      if (q && q.correctAnswer === a.answer) correct++;
    }

    const total = questions.length;
    const score = Math.round((correct / total) * 100);

    await QuizDailyAttempt.create({
      userId,
      date,
      score
    });

    // 🔥 DAILY LEADERBOARD
    await QuizLeaderboardService.updateFromDailyQuiz({
      userId,
      score,
      correct
    });

    const xpEarned = correct * 15;
    const levelProgress = await QuizLevelService.addXp(userId, xpEarned);

    return {
      date,
      score,
      correct,
      total,
      xpEarned,
      levelProgress
    };
  }
};