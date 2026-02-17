import AppError from "../../core/AppError";
import { Prayer } from "./prayer.model";
import { PrayerLikeService } from "./prayerLike.service";
import { NotificationService } from "../notifications/notification.service";
import mongoose from "mongoose";

export const PrayerService = {

  /* ======================================================
        CREATE PRAYER
        Auto published if visibility = public
  ====================================================== */
  create: async (userId: string, data: any) => {
    const prayer = await new Prayer({
      ...data,
      user: userId
    }).save();

    // Optional: notify admin (informational only)
    NotificationService.create(
      "ADMIN",
      "New Prayer Submitted",
      "A new prayer has been posted.",
      "prayer-new",
      { prayerId: prayer._id.toString() }
    ).catch(() => {});

    return prayer;
  },

  /* ======================================================
        GET PUBLIC PRAYER WALL
  ====================================================== */
  getPublic: async (page = 1, limit = 20, userId?: string) => {
    const skip = (page - 1) * limit;

    const prayers = await Prayer.find({
      visibility: "public"
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("user", "username");

    const total = await Prayer.countDocuments({
      visibility: "public"
    });

    const enriched = await Promise.all(
      prayers.map(async (prayer) => {
        const id = prayer._id.toString();

        return {
          ...prayer.toObject(),
          prayCount: await PrayerLikeService.count(id),
          userPrayed: userId
            ? await PrayerLikeService.userPrayed(userId, id)
            : false
        };
      })
    );

    return { prayers: enriched, total };
  },

  /* ======================================================
        GET USER PRAYERS
  ====================================================== */
  getUserPrayers: async (userId: string) => {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    return Prayer.find({ user: userId })
      .sort({ createdAt: -1 });
  },

  /* ======================================================
        USER: MARK AS ANSWERED
        Only owner can mark answered
  ====================================================== */
  markAnswered: async (prayerId: string, userId: string) => {
    const prayer = await Prayer.findById(prayerId);

    if (!prayer) {
      throw new AppError("Prayer not found", 404);
    }

    if (prayer.user.toString() !== userId) {
      throw new AppError("Unauthorized", 403);
    }

    prayer.isAnswered = true;
    await prayer.save();

    // Optional: notify community
    NotificationService.create(
      "ALL",
      "A Prayer Has Been Answered!",
      "One of the community prayers has been marked as answered.",
      "prayer-answered",
      { prayerId: prayer._id.toString() }
    ).catch(() => {});

    return prayer;
  },

  /* ======================================================
        DELETE PRAYER
        - Owner can delete
        - Admin can delete
  ====================================================== */
  delete: async (prayerId: string, userId: string, role: string) => {
    const prayer = await Prayer.findById(prayerId);

    if (!prayer) {
      throw new AppError("Prayer not found", 404);
    }

    const isOwner = prayer.user.toString() === userId;
    const isAdmin = role === "admin";

    if (!isOwner && !isAdmin) {
      throw new AppError("Unauthorized", 403);
    }

    await prayer.deleteOne();

    return { message: "Prayer deleted successfully" };
  }
};