import { QuizLeaderboard } from "./quizLeaderboard.model";

type LeaderboardType = "global" | "daily";

export const QuizLeaderboardService = {
  /* =====================================================
     UPDATE LEADERBOARD (GLOBAL OR DAILY)
  ===================================================== */
  async update(params: {
    userId: string;
    score: number;
    correct: number;
    type?: LeaderboardType;
    date?: string;
  }) {
    const {
      userId,
      score,
      correct,
      type = "global",
      date
    } = params;

    const query: any = {
      userId,
      type
    };

    // Daily leaderboard requires date
    if (type === "daily") {
      if (!date) {
        throw new Error("Date is required for daily leaderboard");
      }
      query.date = date;
    }

    return await QuizLeaderboard.findOneAndUpdate(
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
    ).select("-__v");
  },

  /* =====================================================
     GET TOP LEADERBOARD
  ===================================================== */
  async top(params?: {
    type?: LeaderboardType;
    date?: string;
    limit?: number;
  }) {
    const {
      type = "global",
      date,
      limit = 20
    } = params || {};

    const query: any = { type };

    if (type === "daily") {
      if (!date) {
        throw new Error("Date is required for daily leaderboard");
      }
      query.date = date;
    }

    return await QuizLeaderboard.find(query)
      .sort({ totalScore: -1, totalCorrect: -1 })
      .limit(limit)
      .select("-__v");
  }
};