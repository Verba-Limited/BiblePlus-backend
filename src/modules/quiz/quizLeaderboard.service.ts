// src/modules/quiz/quizLeaderboard.service.ts

import AppError from "../../core/AppError";
import { QuizLeaderboard } from "./quizLeaderboard.model";
import { User } from "../auth/auth.model";
import {
  getToday,
  getWeekKey,
  getMonthKey
} from "./quizLeaderboard.utils";

/* ======================================
   TYPES
====================================== */
export type LeaderboardType =
  | "global"
  | "daily"
  | "weekly"
  | "monthly";

interface UpdateDailyParams {
  userId: string;
  score: number;
  correct: number;
}

interface GetTopParams {
  type: LeaderboardType;
  date?: string;
  week?: string;
  month?: string;
  limit?: number;
}

export const QuizLeaderboardService = {
  /* =====================================================
     UPDATE ALL LEADERBOARDS
     (GLOBAL + DAILY + WEEKLY + MONTHLY)
  ===================================================== */
  async updateFromDailyQuiz({
    userId,
    score,
    correct
  }: UpdateDailyParams): Promise<void> {
    if (!userId) {
      throw new AppError("userId is required", 400);
    }

    // 🔐 Source of truth
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
     GET LEADERBOARD
  ===================================================== */
  async getTop({
    type,
    date,
    week,
    month,
    limit = 20
  }: GetTopParams) {
    const query: Record<string, any> = { type };

    if (type === "daily") {
      if (!date) {
        throw new AppError(
          "date is required for daily leaderboard",
          400
        );
      }
      query.date = date;
    }

    if (type === "weekly") {
      if (!week) {
        throw new AppError(
          "week is required for weekly leaderboard",
          400
        );
      }
      query.week = week;
    }

    if (type === "monthly") {
      if (!month) {
        throw new AppError(
          "month is required for monthly leaderboard",
          400
        );
      }
      query.month = month;
    }

    return QuizLeaderboard.find(query)
      .sort({
        totalScore: -1,
        totalCorrect: -1,
        updatedAt: 1
      })
      .limit(limit)
      .select(
        "username avatar totalScore totalCorrect totalPlayed"
      )
      .lean();
  }
};