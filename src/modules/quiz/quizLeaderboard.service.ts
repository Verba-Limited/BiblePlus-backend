// src/modules/quiz/quizLeaderboard.service.ts

import { QuizProgress } from "./quizProgress.model";
import AppError from "../../core/AppError";

/* ============================================
   WEEK HELPER
============================================ */
const getCurrentWeekKey = () => {
  const now = new Date();
  const firstJan = new Date(now.getFullYear(), 0, 1);
  const days = Math.floor(
    (now.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000)
  );
  const week = Math.ceil((days + firstJan.getDay() + 1) / 7);

  return `${now.getFullYear()}-W${week}`;
};

export const QuizLeaderboardService = {

  /* ============================================
     AUTO WEEKLY RESET
  ============================================ */
  async resetWeeklyIfNeeded() {
    const currentWeek = getCurrentWeekKey();

    await QuizProgress.updateMany(
      { lastWeeklyReset: { $ne: currentWeek } },
      {
        $set: {
          weeklyXp: 0,
          weeklyCorrect: 0,
          weeklyAttempts: 0,
          lastWeeklyReset: currentWeek
        }
      }
    );
  },

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
     WEEKLY LEADERBOARD
  ============================================ */
  async getWeekly(limit = 50) {
    await this.resetWeeklyIfNeeded();

    const users = await QuizProgress.find()
      .sort({
        weeklyXp: -1,
        weeklyCorrect: -1,
        weeklyAttempts: 1
      })
      .limit(limit)
      .populate("userId", "username avatar")
      .lean<any>();

    return users.map((u: any, index: number) => ({
      rank: index + 1,
      userId: u.userId?._id,
      username: u.userId?.username,
      avatar: u.userId?.avatar,
      weeklyXp: u.weeklyXp,
      weeklyCorrect: u.weeklyCorrect,
      weeklyAttempts: u.weeklyAttempts
    }));
  },

  /* ============================================
     GET GLOBAL USER RANK
  ============================================ */
  async getUserGlobalRank(userId: string) {
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
  },

  /* ============================================
     GET WEEKLY USER RANK
  ============================================ */
  async getUserWeeklyRank(userId: string) {
    await this.resetWeeklyIfNeeded();

    const all = await QuizProgress.find()
      .sort({ weeklyXp: -1 })
      .select("userId weeklyXp")
      .lean();

    const index = all.findIndex(
      u => u.userId.toString() === userId
    );

    if (index === -1) {
      throw new AppError("User not ranked this week", 404);
    }

    return {
      rank: index + 1,
      weeklyXp: all[index].weeklyXp
    };
  }
};