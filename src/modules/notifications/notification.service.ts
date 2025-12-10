import { Notification } from "./notification.model";
import { SocketNotify } from "./socketNotify";
import AppError from "../../core/AppError";

export const NotificationService = {

  /* ==================================================
        SEND TO USER
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
       ADMIN: LIST ALL (PAGINATED)
  ================================================== */
  listAll: async (page = 1, limit = 20, type?: string) => {
    const query: any = {};
    if (type) query.type = type;

    const skip = (page - 1) * limit;

    const items = await Notification.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(query);

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
        ADMIN: DELETE NOTIFICATION
  ================================================== */
  delete: async (id: string) => {
    const removed = await Notification.findByIdAndDelete(id);
    if (!removed) throw new AppError("Notification not found", 404);

    return removed;
  },

  /* ==================================================
        ADMIN: RESEND NOTIFICATION
  ================================================== */
  resend: async (id: string) => {
    const notif = await Notification.findById(id);
    if (!notif) throw new AppError("Notification not found", 404);

    if (notif.userId === "ALL") {
      // resend broadcast
      SocketNotify.sendToAll({
        id: notif._id.toString(),
        title: notif.title,
        message: notif.message,
        type: notif.type,
        data: notif.data,
        read: false,
        createdAt: notif.createdAt
      });
    } else {
      SocketNotify.sendToUser(notif.userId, {
        id: notif._id.toString(),
        title: notif.title,
        message: notif.message,
        type: notif.type,
        data: notif.data,
        read: false,
        createdAt: notif.createdAt
      });
    }

    return notif;
  },

  /* ==================================================
       USER NOTIFICATIONS
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

  markAsRead: async (id: string) => {
    return await Notification.findByIdAndUpdate(
      id,
      { read: true },
      { new: true }
    );
  },

  markAllAsRead: async (userId: string) => {
    return await Notification.updateMany({ userId }, { read: true });
  },

  unreadCount: async (userId: string) => {
    return await Notification.countDocuments({
      $or: [{ userId }, { userId: "ALL" }],
      read: false
    });
  }
};
