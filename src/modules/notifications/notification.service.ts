import { Notification } from "./notification.model";
import { sendPushToUser, sendPushToAll } from "../../utils/push";
import { getIO } from "../../socket/socket";
import mongoose from "mongoose";
import AppError from "../../core/AppError";

export const NotificationService = {

  /* ============================================
     CREATE NOTIFICATION
  ============================================ */
  async create(
    target: "USER" | "ALL",
    title: string,
    message: string,
    type = "general",
    options?: { userId?: string; blogId?: string }
  ) {

    const io = getIO();

    // ===============================
    // USER-SPECIFIC
    // ===============================
    if (target === "USER") {

      if (!options?.userId) {
        throw new AppError("userId required for USER notification", 400);
      }

      const notification = await Notification.create({
        user: new mongoose.Types.ObjectId(options.userId),
        target,
        title,
        message,
        type
      });

      // 🔴 REAL-TIME EMIT
      io.to(options.userId).emit("notification", notification);

      // 🔔 PUSH
      try {
        await sendPushToUser(options.userId, title, message);
      } catch (err) {
        console.log("Push failed:", err);
      }

      return notification;
    }

    // ===============================
    // BROADCAST TO ALL
    // ===============================
    if (target === "ALL") {

      const notification = await Notification.create({
        target,
        title,
        message,
        type
      });

      // 🔴 REAL-TIME BROADCAST
      io.emit("notification", notification);

      // 🔔 PUSH BROADCAST
      try {
        await sendPushToAll(title, message);
      } catch (err) {
        console.log("Broadcast push failed:", err);
      }

      return notification;
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
     UNREAD COUNT
  ============================================ */
  async getUnreadCount(userId: string) {

    const count = await Notification.countDocuments({
      user: userId,
      read: false
    });

    return { unread: count };
  },

  /* ============================================
     MARK AS READ
  ============================================ */
  async markAsRead(notificationId: string, userId: string) {

    const updated = await Notification.findOneAndUpdate(
      {
        _id: notificationId,
        user: userId
      },
      { read: true },
      { new: true }
    );

    if (!updated) {
      throw new AppError("Notification not found", 404);
    }

    return updated;
  },

  /* ============================================
     MARK ALL AS READ
  ============================================ */
  async markAllAsRead(userId: string) {

    await Notification.updateMany(
      { user: userId, read: false },
      { read: true }
    );

    return { message: "All notifications marked as read" };
  },

  /* ============================================
     ADMIN: LIST ALL NOTIFICATIONS
  ============================================ */
  async listAll(page: number, limit: number, type?: string) {
    const query = type ? { type } : {};
    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .populate("user", "firstName lastName email avatar");
    const total = await Notification.countDocuments(query);
    return { notifications, total, page, limit };
  },

  /* ============================================
     ADMIN: DELETE NOTIFICATION
  ============================================ */
  async deleteNotification(id: string) {
    await Notification.findByIdAndDelete(id);
  },

  /* ============================================
     ADMIN: RESEND NOTIFICATION
  ============================================ */
  async resend(id: string) {
    const notif = await Notification.findById(id);
    if (!notif) throw new AppError("Notification not found", 404);

    if (notif.target === "ALL") {
      await sendPushToAll(notif.title, notif.message);
    } else if (notif.user) {
      await sendPushToUser(notif.user.toString(), notif.title, notif.message);
    }

    return notif;
  }
};