import AppError from "../../core/AppError";
import { QuizLeaderboard } from "./quizLeaderboard.model";
import {
  getToday,
  getWeekKey,
  getMonthKey
} from "./quizLeaderboard.utils";

export const QuizLeaderboardService = {
  /* =====================================================
     UPDATE ALL LEADERBOARDS FROM DAILY QUIZ RESULT
  ===================================================== */
  async updateFromDailyQuiz(params: {
    userId: string;
    score: number;
    correct: number;
    username?: string;
    avatar?: string;
  }) {
    const { userId, score, correct, username, avatar } = params;

    const updates = [
      {
        type: "global"
      },
      {
        type: "daily",
        date: getToday()
      },
      {
        type: "weekly",
        week: getWeekKey()
      },
      {
        type: "monthly",
        month: getMonthKey()
      }
    ];

    for (const u of updates) {
      await QuizLeaderboard.findOneAndUpdate(
        { userId, ...u },
        {
          $inc: {
            totalScore: score,
            totalCorrect: correct,
            totalPlayed: 1
          },
          $set: {
            username,
            avatar
          }
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );
    }
  },

  /* =====================================================
     GET LEADERBOARD
  ===================================================== */
  async getTop(params: {
    type: "global" | "daily" | "weekly" | "monthly";
    date?: string;
    week?: string;
    month?: string;
    limit?: number;
  }) {
    const { type, limit = 20 } = params;

    const query: any = { type };

    if (type === "daily") query.date = params.date;
    if (type === "weekly") query.week = params.week;
    if (type === "monthly") query.month = params.month;

    if (
      (type === "daily" && !params.date) ||
      (type === "weekly" && !params.week) ||
      (type === "monthly" && !params.month)
    ) {
      throw new AppError("Missing time key for leaderboard", 400);
    }

    return QuizLeaderboard.find(query)
      .sort({ totalScore: -1, totalCorrect: -1 })
      .limit(limit)
      .select("-__v")
      .lean();
  }
};