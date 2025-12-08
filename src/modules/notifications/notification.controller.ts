import { Request, Response, NextFunction } from "express";
import { NotificationService } from "./notification.service";
import { SocketNotify } from "./socketNotify";

export const NotificationController = {
  // Get all notifications for the logged-in user
  getMyNotifications: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const data = await NotificationService.getUserNotifications(userId);
      const unread = await NotificationService.unreadCount(userId);

      res.json({ success: true, data, unread });
    } catch (err) {
      next(err);
    }
  },

  // Mark a specific notification as read
  markRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const notificationId = req.params.id;

      const updated = await NotificationService.markAsRead(notificationId);

      // @ts-ignore
      const userId = req.userId;

      // Send updated unread count to user
      const unread = await NotificationService.unreadCount(userId);
      SocketNotify.sendToUser(userId, {
        type: "unreadCountUpdate",
        unread
      });

      res.json({ success: true, data: updated, unread });
    } catch (err) {
      next(err);
    }
  },

  // Mark ALL notifications as read
  markAllRead: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      await NotificationService.markAllAsRead(userId);

      // Update unread badge in real-time
      SocketNotify.sendToUser(userId, {
        type: "unreadCountUpdate",
        unread: 0
      });

      res.json({ success: true, message: "All notifications marked as read", unread: 0 });
    } catch (err) {
      next(err);
    }
  },

  // Get unread count only
  getUnreadCount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const unread = await NotificationService.unreadCount(userId);

      res.json({ success: true, unread });
    } catch (err) {
      next(err);
    }
  }
};
 