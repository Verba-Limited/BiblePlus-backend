import { Notification } from "./notification.model";
import { SocketNotify } from "./socketNotify";

export const NotificationService = {

  /* ==================================================
        SEND NOTIFICATION TO ONE USER
  ================================================== */
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
      data,
      read: false
    });

    // Real-time push
    SocketNotify.sendToUser(userId, {
      id: notif._id.toString(),
      title,
      message,
      type,
      data,
      read: false,
      createdAt: notif.createdAt
    });

    return notif;
  },

  /* ==================================================
        ADMIN: BROADCAST TO ALL USERS
  ================================================== */
  broadcast: async (
    title: string,
    message: string,
    type = "system",
    data: any = {}
  ) => {
    // Save only 1 record with userId = "ALL"
    const notif = await Notification.create({
      userId: "ALL",
      title,
      message,
      type,
      data,
      read: false
    });

    SocketNotify.sendToAll({
      id: notif._id.toString(),
      title,
      message,
      type,
      data,
      read: false,
      createdAt: notif.createdAt
    });

    return notif;
  },

  /* ==================================================
        GET NOTIFICATIONS FOR USER (PAGINATED)
  ================================================== */
  getUserNotifications: async (userId: string, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const items = await Notification.find({
      $or: [{ userId }, { userId: "ALL" }]
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments({
      $or: [{ userId }, { userId: "ALL" }]
    });

    return {
      notifications: items,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit)
      }
    };
  },

  /* ==================================================
        MARK AS READ
  ================================================== */
  markAsRead: async (notificationId: string) => {
    return await Notification.findByIdAndUpdate(
      notificationId,
      { read: true },
      { new: true }
    );
  },

  /* ==================================================
        MARK ALL AS READ
  ================================================== */
  markAllAsRead: async (userId: string) => {
    return await Notification.updateMany(
      { userId },
      { read: true }
    );
  },

  /* ==================================================
        UNREAD COUNT
  ================================================== */
  unreadCount: async (userId: string) => {
    return await Notification.countDocuments({
      $or: [{ userId }, { userId: "ALL" }],
      read: false
    });
  }
};
