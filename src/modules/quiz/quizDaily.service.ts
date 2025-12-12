import { QuizLoader } from "./quiz.loader";
import { QuizStreak } from "./quizStreak.model";
import { QuizAttempt } from "./quizAttempt.model";
import AppError from "../../core/AppError";

export const QuizDailyService = {
  /* =======================================================
      1. GET TODAY'S QUIZ
  ======================================================= */
  getDailyQuiz: async () => {
    const todayKey = QuizDailyService._todayKey();

    // Randomize fresh set of 5 questions
    const shuffled = [...QuizLoader.questions].sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, 5);

    return {
      date: todayKey,
      timer: 30,
      questions
    };
  },

  /* =======================================================
      2. COMPLETE DAILY QUIZ
  ======================================================= */
  completeDailyQuiz: async (userId: string, answers: any[]) => {
    const todayKey = QuizDailyService._todayKey();

    // -------------------------------------------------------
    // A. Prevent multiple attempts per day
    // -------------------------------------------------------
    const already = await QuizAttempt.findOne({ userId, date: todayKey });
    if (already) throw new AppError("You already completed today's quiz!", 400);

    // -------------------------------------------------------
    // B. Save today's attempt
    // -------------------------------------------------------
    await QuizAttempt.create({
      userId,
      date: todayKey,
      answers
    });

    // -------------------------------------------------------
    // C. STREAK LOGIC
    // -------------------------------------------------------
    let streak = await QuizStreak.findOne({ userId });

    if (!streak) {
      // First time ever
      streak = await QuizStreak.create({
        userId,
        lastCompleted: todayKey,
        streak: 1
      });
    } else {
      const diffDays = QuizDailyService._daysBetween(
        streak.lastCompleted,
        todayKey
      );

      if (diffDays === 1) {
        streak.streak += 1; // Continue streak
      } else if (diffDays > 1) {
        streak.streak = 1; // Reset streak
      }

      streak.lastCompleted = todayKey;
      await streak.save();
    }

    return {
      streak: streak.streak,
      lastCompleted: streak.lastCompleted
    };
  },

  /* =======================================================
      UTIL: Get YYYY-MM-DD (timezone safe)
  ======================================================= */
  _todayKey: (): string => {
    return new Date().toISOString().split("T")[0];
  },

  /* =======================================================
      UTIL: Days between two YYYY-MM-DD dates
  ======================================================= */
  _daysBetween: (d1: string, d2: string): number => {
    const a = new Date(d1 + "T00:00:00");
    const b = new Date(d2 + "T00:00:00");
    return Math.floor((b.getTime() - a.getTime()) / 86400000);
  }
};
