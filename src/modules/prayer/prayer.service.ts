import AppError from "../../core/AppError";
import { Prayer } from "./prayer.model";
import { PrayerLikeService } from "./prayerLike.service";
import { NotificationService } from "../notifications/notification.service";

export const PrayerService = {
  // -----------------------------------------------------
  // CREATE a new prayer request
  // -----------------------------------------------------
  create: async (data: any) => {
    const prayer = await Prayer.create(data);
    const created = Array.isArray(prayer) ? prayer[0] : prayer;

    // Notify admin (or system) that a new prayer was submitted
    NotificationService.create(
      "ADMIN",
      "New Prayer Request",
      `A new prayer request has been submitted.`,
      "prayer-new",
      { prayerId: (created as any)?._id?.toString?.() ?? null }
    ).catch(() => {});

    return prayer;
  },

  // -----------------------------------------------------
  // PUBLIC approved prayer requests with pray count
  // -----------------------------------------------------
  getPublic: async (page = 1, limit = 20, userId?: string) => {
    const skip = (page - 1) * limit;

    const requests = await Prayer.find({
      visibility: "public",
      status: "approved"
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Prayer.countDocuments({
      visibility: "public",
      status: "approved"
    });

    const enrichedRequests = await Promise.all(
      requests.map(async (req) => {
        const id = req._id.toString();

        const prayCount = await PrayerLikeService.count(id);
        const prayed = userId
          ? await PrayerLikeService.userPrayed(userId, id)
          : false;

        return {
          ...req.toObject(),
          prayCount,
          userPrayed: prayed
        };
      })
    );

    return { requests: enrichedRequests, total };
  },

  // -----------------------------------------------------
  // GET user's own prayer requests
  // -----------------------------------------------------
  getUserRequests: async (userId: string) => {
    return await Prayer.find({ userId }).sort({ createdAt: -1 });
  },

  // -----------------------------------------------------
  // ADMIN: APPROVE a prayer request
  // -----------------------------------------------------
  approve: async (id: string) => {
    const updated = await Prayer.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );

    if (!updated) throw new AppError("Prayer request not found", 404);

    // Notify the user that their prayer was approved
    NotificationService.create(
      updated.userId,
      "Prayer Approved",
      "Your prayer request has been approved and is now public.",
      "prayer-approved",
      { prayerId: updated._id.toString() }
    ).catch(() => {});

    return updated;
  },

  // -----------------------------------------------------
  // ADMIN: MARK a prayer as answered
  // -----------------------------------------------------
  markAnswered: async (id: string) => {
    const updated = await Prayer.findByIdAndUpdate(
      id,
      { status: "answered" },
      { new: true }
    );

    if (!updated) throw new AppError("Prayer request not found", 404);

    // Notify ONLY the user that their prayer was answered
    NotificationService.create(
      updated.userId,
      "Prayer Answered",
      "Your prayer request has been marked as answered.",
      "prayer-answered",
      { prayerId: updated._id.toString() }
    ).catch(() => {});

    // OPTIONAL: notify all users when a prayer is answered  
    // (uncomment if needed)
    
    NotificationService.create(
      "ALL",
      "Prayer Answered",
      "A prayer request in the community has been answered!",
      "prayer-answered-public",
      { prayerId: updated._id.toString() }
    ).catch(() => {});
    

    return updated;
  }
};
