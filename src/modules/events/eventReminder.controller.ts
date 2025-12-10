import { Request, Response, NextFunction } from "express";
import { EventReminderService } from "./eventReminder.service";

export const EventReminderController = {

  add: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { eventId } = req.body;

      const data = await EventReminderService.add(userId, eventId);

      res.json({ success: true, message: "Reminder added", data });
    } catch (err) {
      next(err);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { eventId } = req.body;

      await EventReminderService.remove(userId, eventId);

      res.json({ success: true, message: "Reminder removed" });
    } catch (err) {
      next(err);
    }
  },

  all: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const data = await EventReminderService.listForUser(userId);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};
