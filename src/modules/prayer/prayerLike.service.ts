import { PrayerLike } from "./prayerLike.model";

export const PrayerLikeService = {
  pray: async (userId: string, prayerId: string) => {
    try {
      return await PrayerLike.create({ userId, prayerId });
    } catch (err: any) {
      // Unique index triggers error if already prayed
      if (err.code === 11000) {
        return { message: "Already prayed" };
      }
      throw err;
    }
  },

  unpray: async (userId: string, prayerId: string) => {
    await PrayerLike.deleteOne({ userId, prayerId });
    return { message: "Prayer removed" };
  },

  count: async (prayerId: string) => {
    return await PrayerLike.countDocuments({ prayerId });
  },

  userPrayed: async (userId: string, prayerId: string) => {
    const record = await PrayerLike.findOne({ userId, prayerId });
    return !!record;
  }
};
