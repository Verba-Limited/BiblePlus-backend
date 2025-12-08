import { Request, Response, NextFunction } from "express";
import { EventAttendanceService } from "./eventAttendance.service";

export const EventAttendanceController = {
  attend: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { eventId } = req.body;

      const data = await EventAttendanceService.attend(userId, eventId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  unattend: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { eventId } = req.body;

      const data = await EventAttendanceService.unattend(userId, eventId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  attendees: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const attendees = await EventAttendanceService.getAttendees(req.params.id);
      res.json({ success: true, data: attendees });
    } catch (err) {
      next(err);
    }
  },

  count: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await EventAttendanceService.countAttendees(req.params.id);
      res.json({ success: true, count });
    } catch (err) {
      next(err);
    }
  },

  userStatus: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { eventId } = req.query;

      const attending = await EventAttendanceService.userIsAttending(
        userId,
        eventId as string
      );

      res.json({ success: true, attending });
    } catch (err) {
      next(err);
    }
  }
};
