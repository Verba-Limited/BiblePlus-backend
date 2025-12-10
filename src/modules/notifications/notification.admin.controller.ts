import { Request, Response, NextFunction } from "express";
import { NotificationService } from "./notification.service";
import AppError from "../../core/AppError";

export const NotificationAdminController = {
  // -----------------------------------------------------
  // SEND TO ONE USER
  // -----------------------------------------------------
  sendToUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId, title, message, type, data } = req.body;

      if (!userId || !title || !message) {
        throw new AppError("userId, title and message are required", 400);
      }

      const notif = await NotificationService.create(
        userId,
        title,
        message,
        type || "admin",
        data || {}
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

  // -----------------------------------------------------
  // BROADCAST TO ALL USERS
  // -----------------------------------------------------
  sendBroadcast: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { title, message, type, data } = req.body;

      if (!title || !message) {
        throw new AppError("title and message are required", 400);
      }

      const notif = await NotificationService.broadcast(
        title,
        message,
        type || "broadcast",
        data || {}
      );

      res.json({
        success: true,
        message: "Broadcast sent to all users",
        data: notif
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // LIST ALL NOTIFICATIONS (ADMIN VIEW)
  // -----------------------------------------------------
  listAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const type = req.query.type as string;

      const data = await NotificationService.listAll(page, limit, type);

      res.json({
        success: true,
        ...data
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // DELETE NOTIFICATION
  // -----------------------------------------------------
  delete: async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = req.params.id;

    await NotificationService.deleteNotification(id);

    res.json({
      success: true,
      message: "Notification deleted"
    });
  } catch (err) {
    next(err);
  }
},


  // -----------------------------------------------------
  // RESEND NOTIFICATION
  // -----------------------------------------------------
  resend: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;

      const result = await NotificationService.resend(id);

      res.json({
        success: true,
        message: "Notification resent successfully",
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
};
