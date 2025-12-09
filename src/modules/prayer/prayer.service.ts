import AppError from "../../core/AppError";
import { Prayer } from "./prayer.model";
import { PrayerLikeService } from "./prayerLike.service";
import { NotificationService } from "../notifications/notification.service";

export const PrayerService = {

  /* ======================================================
        CREATE PRAYER REQUEST
  ====================================================== */
  create: async (data: any) => {
    const prayer = await Prayer.create(data);

    // Ensure we have a single document
    const created = Array.isArray(prayer) ? prayer[0] : prayer;

    // Notify admin that a prayer request was submitted
    NotificationService.create(
      "ADMIN",
      "New Prayer Request Submitted",
      `A new prayer request has been submitted for review.`,
      "prayer-new",
      { prayerId: created?._id?.toString() }
    ).catch(() => {});

    return created;
  },

  /* ======================================================
        GET PUBLIC PRAYER WALL
  ====================================================== */
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

    // Add prayCount + userPrayed to each request
    const enrichedRequests = await Promise.all(
      requests.map(async (req) => {
        const id = req._id.toString();

        return {
          ...req.toObject(),
          prayCount: await PrayerLikeService.count(id),
          userPrayed: userId
            ? await PrayerLikeService.userPrayed(userId, id)
            : false
        };
      })
    );

    return { requests: enrichedRequests, total };
  },

  /* ======================================================
        GET USER'S OWN REQUESTS
  ====================================================== */
  getUserRequests: async (userId: string) => {
    return await Prayer.find({ userId }).sort({ createdAt: -1 });
  },

  /* ======================================================
        ADMIN: APPROVE PRAYER REQUEST
  ====================================================== */
  approve: async (id: string) => {
    const updated = await Prayer.findByIdAndUpdate(
      id,
      { status: "approved" },
      { new: true }
    );

    if (!updated) throw new AppError("Prayer request not found", 404);

    // Notify user that prayer is approved
    NotificationService.create(
      updated.userId,
      "Prayer Approved",
      "Your prayer request has been approved and is now visible publicly.",
      "prayer-approved",
      { prayerId: updated._id.toString() }
    ).catch(() => {});

    return updated;
  },

  /* ======================================================
        ADMIN: MARK PRAYER AS ANSWERED
  ====================================================== */
  markAnswered: async (id: string) => {
    const updated = await Prayer.findByIdAndUpdate(
      id,
      { status: "answered" },
      { new: true }
    );

    if (!updated) throw new AppError("Prayer request not found", 404);

    // Notify user privately
    NotificationService.create(
      updated.userId,
      "Prayer Answered",
      "Your prayer has been marked as answered.",
      "prayer-answered",
      { prayerId: updated._id.toString() }
    ).catch(() => {});

    // OPTIONAL: notify all users
    NotificationService.create(
      "ALL",
      "A Prayer Has Been Answered!",
      "A prayer request in the community has been answered!",
      "prayer-answered-public",
      { prayerId: updated._id.toString() }
    ).catch(() => {});

    return updated;
  },

  /* ======================================================
        ADMIN: DELETE PRAYER REQUEST
  ====================================================== */
  delete: async (id: string) => {
    const removed = await Prayer.findByIdAndDelete(id);
    if (!removed) throw new AppError("Prayer request not found", 404);

    return removed;
  }
};
