// src/modules/quiz/quizLeaderboard.service.ts

import { QuizProgress } from "./quizProgress.model";
import AppError from "../../core/AppError";

export const QuizLeaderboardService = {

  /* ============================================
     GLOBAL XP LEADERBOARD
  ============================================ */
  async getGlobal(limit = 50) {
    const users = await QuizProgress.find()
      .sort({
        totalXp: -1,
        totalCorrect: -1,
        totalAttempts: 1
      })
      .limit(limit)
      .populate("userId", "username avatar")
      .lean<any>();

    return users.map((u: any, index: number) => ({
      rank: index + 1,
      userId: u.userId?._id,
      username: u.userId?.username,
      avatar: u.userId?.avatar,
      totalXp: u.totalXp,
      totalCorrect: u.totalCorrect,
      totalAttempts: u.totalAttempts,
      highestLevel: u.highestLevel
    }));
  },

  /* ============================================
     GET USER RANK
  ============================================ */
  async getUserRank(userId: string) {
    const all = await QuizProgress.find()
      .sort({ totalXp: -1 })
      .select("userId totalXp")
      .lean();

    const index = all.findIndex(
      u => u.userId.toString() === userId
    );

    if (index === -1) {
      throw new AppError("User not ranked yet", 404);
    }

    return {
      rank: index + 1,
      totalXp: all[index].totalXp
    };
  }
};