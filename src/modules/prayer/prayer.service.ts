import AppError from "../../core/AppError";
import { IPrayer, Prayer } from "./prayer.model";
import { User } from "../auth/auth.model";
import { EmailService } from "../../services/email.service";
import { PushService } from "../../services/push.service";
import mongoose from "mongoose";

export const PrayerService = {

  /* ============================================
     CREATE PRAYER
  ============================================ */
  async create(userId: string, data: any) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    const prayer = await Prayer.create({
      ...data,
      user: new mongoose.Types.ObjectId(userId),
      visibility: data.visibility || "public"
    }) as unknown as IPrayer;

    // ✅ Only notify for public prayers
    if (prayer.visibility === "public") {
      const requester = await User.findById(userId).select("firstName");
      const requesterName = requester?.firstName || "A fellow believer";

      // ✅ Get all users except the one who posted
      const users = await User.find({
        _id: { $ne: userId },
        verified: true
      }).select("email firstName fcmToken");

      // ✅ Send email + push in background — don't block response
      setImmediate(async () => {
        for (const user of users) {
          // Email notification
          if (user.email) {
            EmailService.sendPrayerRequest(
              user.email,
              user.firstName || "Friend",
              prayer,
              requesterName
            ).catch(console.error);
          }

          // Push notification
          if (user.fcmToken) {
            PushService.sendToUser(
              user._id.toString(),
              "🙏 Prayer Request",
              `${requesterName} needs your prayers: ${prayer.title}`
            ).catch(console.error);
          }

          // ✅ Small delay to avoid overwhelming email provider
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      });
    }

    return prayer;
  },

  /* ============================================
     PUBLIC PRAYERS
  ============================================ */
  async getPublic(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const prayers = await Prayer.find({ visibility: "public" })
      .populate("user", "username email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Prayer.countDocuments({ visibility: "public" });

    return { prayers, total };
  },

  /* ============================================
     DELETE PRAYER (USER)
  ============================================ */
  deletePrayer: async (prayerId: string, userId: string) => {
    const prayer = await Prayer.findById(prayerId);

    if (!prayer) {
      throw new AppError("Prayer not found", 404);
    }

    // 🔒 Security check
    if (prayer.user.toString() !== userId) {
      throw new AppError("You cannot delete this prayer", 403);
    }

    await prayer.deleteOne();
    return prayer;
  },

  /* ============================================
     USER'S OWN PRAYERS
  ============================================ */
  async getUserPrayers(userId: string) {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new AppError("Invalid user ID", 400);
    }

    return Prayer.find({ user: userId }).sort({ createdAt: -1 });
  },

  /* ============================================
     DELETE PRAYER (ADMIN)
  ============================================ */
  async delete(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError("Invalid prayer ID", 400);
    }

    const removed = await Prayer.findByIdAndDelete(id);
    if (!removed) throw new AppError("Prayer not found", 404);

    return removed;
  }
};