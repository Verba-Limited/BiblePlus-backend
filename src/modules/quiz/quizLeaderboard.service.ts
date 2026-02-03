import AppError from "../../core/AppError";
import { QuizLeaderboard } from "./quizLeaderboard.model";
import { User } from "../auth/auth.model";
import {
  getToday,
  getWeekKey,
  getMonthKey
} from "./quizLeaderboard.utils";

export type LeaderboardType =
  | "global"
  | "daily"
  | "weekly"
  | "monthly";

export const QuizLeaderboardService = {
  /* =====================================================
     UPDATE LEADERBOARD (CALLED FROM ANY QUIZ TYPE)
     normal | puzzle | daily
  ===================================================== */
  async update(params: {
    userId: string;
    score: number;
    correct: number;
  }) {
    const { userId, score, correct } = params;

    if (!userId) {
      throw new AppError("userId is required", 400);
    }

    const user = await User.findById(userId)
      .select("username avatar")
      .lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const scopes = [
      { type: "global" as const },
      { type: "daily" as const, date: getToday() },
      { type: "weekly" as const, week: getWeekKey() },
      { type: "monthly" as const, month: getMonthKey() }
    ];

    await Promise.all(
      scopes.map(scope =>
        QuizLeaderboard.findOneAndUpdate(
          { userId, ...scope },
          {
            $inc: {
              totalScore: score,
              totalCorrect: correct,
              totalPlayed: 1
            },
            $set: {
              username: user.username,
              avatar: user.avatar
            }
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true
          }
        )
      )
    );
  },

  /* =====================================================
     GET LEADERBOARD (ALL USERS)
  ===================================================== */
  async getTop(params: {
    type: LeaderboardType;
    date?: string;
    week?: string;
    month?: string;
    limit?: number;
  }) {
    const {
      type,
      date,
      week,
      month,
      limit = 20
    } = params;

    const query: Record<string, any> = { type };

    if (type === "daily") {
      if (!date) throw new AppError("date required", 400);
      query.date = date;
    }

    if (type === "weekly") {
      if (!week) throw new AppError("week required", 400);
      query.week = week;
    }

    if (type === "monthly") {
      if (!month) throw new AppError("month required", 400);
      query.month = month;
    }

    return QuizLeaderboard.find(query)
      .sort({
        totalScore: -1,
        totalCorrect: -1,
        totalPlayed: 1
      })
      .limit(limit)
      .select("username avatar totalScore totalCorrect totalPlayed")
      .lean();
  }
};