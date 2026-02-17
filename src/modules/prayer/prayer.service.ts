import AppError from "../../core/AppError";
import { Prayer } from "./prayer.model";
import { PrayerLikeService } from "./prayerLike.service";
import { NotificationService } from "../notifications/notification.service";
import mongoose from "mongoose";

export const PrayerService = {

  /* ============================================
     CREATE PRAYER
  ============================================ */
  async create(userId: string, data: any) {
    return Prayer.create({
      ...data,
      userId,
      visibility: data.visibility || "public"
    });
  },

  /* ============================================
     PUBLIC PRAYERS
  ============================================ */
  async getPublic(
    page = 1,
    limit = 20,
    userId?: string
  ) {
    const skip = (page - 1) * limit;

    const prayers = await Prayer.find({
      visibility: "public"
    })
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
    return Prayer.find({ userId })
      .sort({ createdAt: -1 });
  },

  /* ============================================
     DELETE PRAYER (ADMIN)
  ============================================ */
  async delete(id: string) {
    const removed = await Prayer.findByIdAndDelete(id);

    if (!removed) {
      throw new AppError("Prayer not found", 404);
    }

    return removed;
  }
};