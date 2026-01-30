// src/modules/quiz/quiz.service.ts
import AppError from "../../core/AppError";
import { QuizQuestion } from "./quizQuestion.model";
import { QuizAttempt } from "./quizAttempt.model";
import { QuizDailyAttempt } from "./quizDailyAttempt";
import { QuizLevelService } from "./quizLevel.service";
import { QuizLeaderboardService } from "./quizLeaderboard.service";

type QuizMode = "normal" | "puzzle";

const getDayKey = (date = new Date()) =>
  date.toISOString().split("T")[0];

export const QuizService = {
  /* =======================================================
     PLAY NORMAL / PUZZLE QUIZ (LEVEL BASED)
  ======================================================= */
  async play(mode: QuizMode, level: number) {
    if (!mode) throw new AppError("Quiz mode is required", 400);
    if (level < 1 || level > 10) {
      throw new AppError("Invalid quiz level", 400);
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
        image: q.image ?? null
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
      throw new AppError("No answers submitted", 400);
    }

    const questions = await QuizQuestion.find({
      _id: { $in: answers.map(a => a.questionId) }
    });

    let correct = 0;

    for (const a of answers) {
      const q = questions.find(
        q => q._id.toString() === a.questionId
      );
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

    const xpEarned = correct * 10;
    const levelProgress = await QuizLevelService.addXp(
      userId,
      xpEarned
    );

    return {
      score,
      correct,
      total,
      unlockedNextLevel: score >= 70,
      xpEarned,
      levelProgress
    };
  },

  /* =======================================================
     GET DAILY QUIZ (TODAY)
  ======================================================= */
  async dailyToday(userId: string) {
    const todayKey = getDayKey();

    const already = await QuizDailyAttempt.findOne({
      userId,
      date: todayKey
    });

    if (already) {
      throw new AppError("Daily quiz already completed", 400);
    }

    const questions = await QuizQuestion.aggregate([
      { $match: { mode: "daily", active: true } },
      { $sample: { size: 5 } }
    ]);

    if (!questions.length) {
      throw new AppError("No daily quiz available", 404);
    }

    return {
      date: todayKey,
      timer: 30,
      total: questions.length,
      questions: questions.map((q: any) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        image: q.image ?? null,

        correctAnswer: q.correctAnswer + 1
      }))
    };
  },

/* =======================================================
     GET DAILY QUIZ BY DATE (READ-ONLY)
     Used for yesterday / past quizzes
  ======================================================= */
  async dailyByDate(date: string) {
    if (!date || typeof date !== "string") {
      throw new AppError("Valid date is required (YYYY-MM-DD)", 400);
    }

    const questions = await QuizQuestion.aggregate([
      { $match: { mode: "daily", active: true } },
      { $sample: { size: 5 } }
    ]);

    if (!questions.length) {
      throw new AppError("No daily quiz found for this date", 404);
    }

    return {
      date,
      total: questions.length,
      questions: questions.map((q: any) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        image: q.image ?? null
      }))
    };
  },

  /* =======================================================
     DAILY QUIZ HISTORY (AVAILABLE DAYS)
  ======================================================= */
  async dailyHistory(limit = 30) {
    return QuizDailyAttempt.aggregate([
      {
        $group: {
          _id: "$date",
          attempts: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } },
      { $limit: limit },
      {
        $project: {
          _id: 0,
          date: "$_id",
          attempts: 1
        }
      }
    ]);
  },

  /* =======================================================
     SUBMIT DAILY QUIZ
  ======================================================= */
  async submitDaily(userId: string, answers: any[]) {
    const todayKey = getDayKey();

    if (!answers?.length) {
      throw new AppError("Answers required", 400);
    }

    const existing = await QuizDailyAttempt.findOne({
      userId,
      date: todayKey
    });

    if (existing) {
      throw new AppError("Daily quiz already submitted", 400);
    }

    const questions = await QuizQuestion.find({
      _id: { $in: answers.map(a => a.questionId) }
    });

    let correct = 0;

    for (const a of answers) {
      const q = questions.find(
        q => q._id.toString() === a.questionId
      );
      if (q && q.correctAnswer === a.answer) correct++;
    }

    const total = answers.length;
    const score = Math.round((correct / total) * 100);

    await QuizDailyAttempt.create({
      userId,
      date: todayKey,
      answers: { score }
    });

    // ✅ Update ALL leaderboards (global, daily, weekly, monthly)
    await QuizLeaderboardService.updateFromDailyQuiz({
      userId,
      score,
      correct
    });

    const xpEarned = correct * 15;
    const levelProgress = await QuizLevelService.addXp(
      userId,
      xpEarned
    );

    return {
      date: todayKey,
      score,
      correct,
      total,
      xpEarned,
      levelProgress
    };
  }
};