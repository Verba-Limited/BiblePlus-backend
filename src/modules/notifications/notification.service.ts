import { Notification } from "./notification.model";
import { sendPushToUser, sendPushToAll } from "../../utils/push";
import mongoose from "mongoose";

export const NotificationService = {

  /* ============================================
     CREATE NOTIFICATION
  ============================================ */
  async create(
    target: "USER" | "ALL",
    title: string,
    message: string,
    type = "general",
    options?: { userId?: string }
  ) {

    // USER-SPECIFIC
    if (target === "USER" && options?.userId) {

      await Notification.create({
        user: new mongoose.Types.ObjectId(options.userId),
        target,
        title,
        message,
        type
      });

      await sendPushToUser(options.userId, title, message);

      return;
    }

    // BROADCAST
    if (target === "ALL") {

      await Notification.create({
        target,
        title,
        message,
        type
      });

      await sendPushToAll(title, message);
    }
  },

  /* ============================================
     GET USER NOTIFICATIONS
  ============================================ */
  async getUserNotifications(userId: string) {
    return Notification.find({
      $or: [
        { user: userId },
        { target: "ALL" }
      ]
    })
      .sort({ createdAt: -1 })
      .limit(50);
  },

  /* ============================================
     MARK AS READ
  ============================================ */
  async markAsRead(notificationId: string, userId: string) {
    return Notification.findOneAndUpdate(
      {
        _id: notificationId,
        user: userId
      },
      { read: true },
      { new: true }
    );
  }
};