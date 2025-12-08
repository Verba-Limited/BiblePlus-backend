import { Notification } from "./notification.model";
import { SocketNotify } from "./socketNotify";

export const NotificationService = {
  // Create a notification + send real-time socket alert
  create: async (
    userId: string,
    title: string,
    message: string,
    type = "general",
    data: any = {}
  ) => {
    const notif = await Notification.create({
      userId,
      title,
      message,
      type,
      data
    });

    // Send instant WebSocket notification
    SocketNotify.sendToUser(userId, {
      id: notif._id,
      title,
      message,
      type,
      data,
      read: false,
      createdAt: notif.createdAt
    });

    return notif;
  },

  // Get notifications for user
  getUserNotifications: async (userId: string) => {
    return await Notification.find({ userId }).sort({ createdAt: -1 });
  },

  // Mark a notification as read
  markAsRead: async (notificationId: string) => {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  },

  // Mark all notifications as read
  markAllAsRead: async (userId: string) => {
    return await Notification.updateMany(
      { userId },
      { read: true }
    );
  },

  // Count unread notifications
  unreadCount: async (userId: string) => {
    return await Notification.countDocuments({ userId, read: false });
  }
};
