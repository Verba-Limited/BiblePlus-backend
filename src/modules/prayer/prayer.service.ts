import AppError from "../../core/AppError";
import { Prayer } from "./prayer.model";
import mongoose from "mongoose";

export const PrayerService = {

  /* ============================================
     CREATE PRAYER
  ============================================ */
  async create(userId: string, data: any) {

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    return Prayer.create({
      ...data,
      user: new mongoose.Types.ObjectId(userId), // ✅ FIXED
      visibility: data.visibility || "public"
    });
  },

  /* ============================================
     PUBLIC PRAYERS
  ============================================ */
  async getPublic(
    page = 1,
    limit = 20
  ) {
    const skip = (page - 1) * limit;

    const prayers = await Prayer.find({
      visibility: "public"
    })
      .populate("user", "username email") // ✅ better for frontend
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Prayer.countDocuments({
      visibility: "public"
    });

    return { prayers, total };
  },

  /* ============================================
     USER'S OWN PRAYERS
  ============================================ */
  async getUserPrayers(userId: string) {

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    return Prayer.find({
      user: userId   // ✅ FIXED
    })
      .sort({ createdAt: -1 });
  },

  /* ============================================
     DELETE PRAYER (ADMIN)
  ============================================ */
  async delete(id: string) {

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid prayer ID", 400);
    }

    const removed = await Prayer.findByIdAndDelete(id);

    if (!removed) {
      throw new AppError("Prayer not found", 404);
    }

    return removed;
  }
};