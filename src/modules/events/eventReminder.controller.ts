import { Request, Response, NextFunction } from "express";
import { EventReminderService } from "./eventReminder.service";
import AppError from "../../core/AppError";

export const EventReminderController = {

  add: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      // ✅ eventId comes from the URL param, not the body
      const eventId = req.params.eventId ?? req.body.eventId;

      if (!userId) throw new AppError("Unauthorized", 401);
      if (!eventId) throw new AppError("Missing event ID", 400);

      const data = await EventReminderService.add(userId, eventId);

      res.json({ success: true, message: "Reminder added", data });
    } catch (err) {
      next(err);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      // ✅ same fix — check params first, fall back to body
      const eventId = req.params.eventId ?? req.body.eventId;

      if (!userId) throw new AppError("Unauthorized", 401);
      if (!eventId) throw new AppError("Missing event ID", 400);

      await EventReminderService.remove(userId, eventId);

      res.json({ success: true, message: "Reminder removed" });
    } catch (err) {
      next(err);
    }
  },

  all: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;

      if (!userId) throw new AppError("Unauthorized", 401);

      const data = await EventReminderService.listForUser(userId);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};