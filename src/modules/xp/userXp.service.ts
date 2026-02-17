import { UserXp } from "./userXp.model";
import mongoose from "mongoose";

const calculateLevel = (xp: number) => {
  return Math.floor(xp / 500) + 1;
};

const getMultiplier = (level: number) => {
  if (level <= 3) return 10;
  if (level <= 6) return 15;
  return 25;
};

export const UserXpService = {
  async addXp(
    userId: string,
    correct: number,
    quizLevel: number
  ) {
    const multiplier = getMultiplier(quizLevel);
    const earnedXp = correct * multiplier;

    let record = await UserXp.findOne({
      user: new mongoose.Types.ObjectId(userId)
    });

    if (!record) {
      record = await UserXp.create({
        user: userId,
        totalXp: earnedXp,
        level: calculateLevel(earnedXp)
      });

      return record;
    }

    record.totalXp += earnedXp;
    record.level = calculateLevel(record.totalXp);

    await record.save();

    return record;
  },

  async getProfile(userId: string) {
    return UserXp.findOne({ user: userId })
      .populate("user", "username avatar")
      .lean();
  },

  async getGlobalRanking(limit = 20) {
    return UserXp.find()
      .sort({ totalXp: -1 })
      .limit(limit)
      .populate("user", "username avatar")
      .lean();
  }
};