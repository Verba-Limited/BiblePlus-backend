import { Request, Response, NextFunction } from "express";
import { NotificationService } from "./notification.service";
import { SocketNotify } from "./socketNotify";

export const NotificationController = {

  /* =====================================================
        USER: GET NOTIFICATIONS (Paginated)
  ===================================================== */
  getMyNotifications: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const page = Number(req.query.page || 1);
      const limit = Number(req.query.limit || 20);

      const data = await NotificationService.getUserNotifications(
        userId,
        page,
        limit
      );

      const unread = await NotificationService.unreadCount(userId);

      res.json({
        success: true,
        ...data,
        unread
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
        USER: MARK ONE NOTIFICATION AS READ
  ===================================================== */
  markRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationId = req.params.id;

      const updated = await NotificationService.markAsRead(notificationId);

      // @ts-ignore
      const userId = req.userId;

      // Update unread count in real-time
      const unread = await NotificationService.unreadCount(userId);
      SocketNotify.sendToUser(userId, {
        type: "unreadCountUpdate",
        unread
      });

      res.json({
        success: true,
        message: "Notification marked as read",
        data: updated,
        unread
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
        USER: MARK ALL AS READ
  ===================================================== */
  markAllRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      await NotificationService.markAllAsRead(userId);

      // Real-time badge update
      SocketNotify.sendToUser(userId, {
        type: "unreadCountUpdate",
        unread: 0
      });

      res.json({
        success: true,
        message: "All notifications marked as read",
        unread: 0
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
        USER: GET UNREAD COUNT
  ===================================================== */
  getUnreadCount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const unread = await NotificationService.unreadCount(userId);

      res.json({
        success: true,
        unread
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
        ADMIN: SEND NOTIFICATION TO ONE USER
  ===================================================== */
  adminSendToUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, title, message, type, data } = req.body;

      const notif = await NotificationService.create(
        userId,
        title,
        message,
        type,
        data
      );

      res.json({
        success: true,
        message: "Notification sent to user",
        data: notif
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
        ADMIN: BROADCAST TO ALL USERS
  ===================================================== */
  adminBroadcast: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, message, type, data } = req.body;

      const notif = await NotificationService.broadcast(
        title,
        message,
        type,
        data
      );

      res.json({
        success: true,
        message: "Broadcast sent to all users",
        data: notif
      });
    } catch (err) {
      next(err);
    }
  }
};
