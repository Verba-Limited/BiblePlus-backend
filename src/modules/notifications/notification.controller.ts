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

      res.json({ success: true, data });

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

      res.json({ success: true, data });

    } catch (err) {
      next(err);
    }
  }
};