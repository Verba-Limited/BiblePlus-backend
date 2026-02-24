import { Request, Response, NextFunction } from "express";
import { NotificationService } from "./notification.service";
import AppError from "../../core/AppError";

export const NotificationController = {

  /* ============================================
     GET MY NOTIFICATIONS
  ============================================ */
  getMyNotifications: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {

      if (!req.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const data = await NotificationService.getUserNotifications(
        req.userId
      );

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     GET UNREAD COUNT
  ============================================ */
  getUnreadCount: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {

      if (!req.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const data = await NotificationService.getUnreadCount(
        req.userId
      );

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     MARK NOTIFICATION AS READ
  ============================================ */
  markAsRead: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {

      if (!req.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const data = await NotificationService.markAsRead(
        req.params.id,
        req.userId
      );

      res.json({
        success: true,
        message: "Notification marked as read",
        data
      });

    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     MARK ALL AS READ
  ============================================ */
  markAllAsRead: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {

      if (!req.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const data = await NotificationService.markAllAsRead(
        req.userId
      );

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     ADMIN BROADCAST
  ============================================ */
  broadcast: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {

      if (req.userRole !== "admin") {
        throw new AppError("Admin only", 403);
      }

      const { title, message } = req.body;

      if (!title || !message) {
        throw new AppError("Title and message are required", 400);
      }

      await NotificationService.create(
        "ALL",
        title,
        message,
        "admin-broadcast"
      );

      res.json({
        success: true,
        message: "Broadcast sent successfully"
      });

    } catch (err) {
      next(err);
    }
  }
};