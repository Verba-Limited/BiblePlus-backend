// src/modules/quiz/quizLeaderboard.service.ts

import AppError from "../../core/AppError";
import { QuizLeaderboard } from "./quizLeaderboard.model";

type LeaderboardType = "global" | "daily";

interface UpdateLeaderboardParams {
  userId: string;
  score: number;
  correct: number;
  type?: LeaderboardType;
  date?: string;
}

interface TopLeaderboardParams {
  type?: LeaderboardType;
  date?: string;
  limit?: number;
}

export const QuizLeaderboardService = {
  /* =====================================================
     UPDATE LEADERBOARD (GLOBAL OR DAILY)
  ===================================================== */
  async update(params: UpdateLeaderboardParams) {
    const {
      userId,
      score,
      correct,
      type = "global",
      date
    } = params;

    if (type === "daily" && !date) {
      throw new AppError(
        "Date is required for daily leaderboard",
        400
      );
    }

    const query: any = {
      userId,
      type
    };

    if (type === "daily") {
      query.date = date;
    }

    return QuizLeaderboard.findOneAndUpdate(
      query,
      {
        $inc: {
          totalScore: score,
          totalCorrect: correct,
          totalPlayed: 1
        }
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    )
      .select("-__v")
      .lean();
  },

  /* =====================================================
     GET TOP LEADERBOARD
  ===================================================== */
  async top(params: TopLeaderboardParams = {}) {
    const {
      type = "global",
      date,
      limit = 20
    } = params;

    if (type === "daily" && !date) {
      throw new AppError(
        "Date is required for daily leaderboard",
        400
      );
    }

    const query: any = { type };

    if (type === "daily") {
      query.date = date;
    }

    return QuizLeaderboard.find(query)
      .sort({
        totalScore: -1,
        totalCorrect: -1,
        updatedAt: 1
      })
      .limit(limit)
      .select("-__v")
      .lean();
  }
};