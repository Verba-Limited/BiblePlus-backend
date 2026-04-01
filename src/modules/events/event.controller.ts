import { Request, Response, NextFunction } from "express";
import { EventService } from "./event.service";
import AppError from "../../core/AppError";
import { EventReminder } from "./eventReminder.model";
import { NotificationService } from "../notifications/notification.service";

export const EventController = {
  /* -----------------------------------------------------
      PUBLIC: GET EVENTS WITH FILTERS
  ----------------------------------------------------- */
  getEvents: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = req.query.category ? String(req.query.category) : undefined;

      const data = await EventService.getEvents({ category });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /* -----------------------------------------------------
      PUBLIC: GET SINGLE EVENT
  ----------------------------------------------------- */
  getEvent: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const data = await EventService.getEvent(id);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /* -----------------------------------------------------
      PUBLIC: UPCOMING EVENTS
  ----------------------------------------------------- */
  upcoming: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await EventService.getUpcoming();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /* -----------------------------------------------------
      PUBLIC: PAST EVENTS
  ----------------------------------------------------- */
  past: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await EventService.getPast();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /* -----------------------------------------------------
      PUBLIC: SEARCH EVENTS
  ----------------------------------------------------- */
  search: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q as string;
      const data = await EventService.searchEvents(query);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  async remindMe(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const eventId = req.params.id;

      await EventReminder.create({
        user: req.userId,
        event: eventId
      });

      await NotificationService.create(
        "USER",
        "Reminder Set",
        "You will be reminded about this event.",
        "event",
        { userId: req.userId }
      );

      res.json({
        success: true,
        message: "Reminder set successfully"
      });
    } catch (err) {
      next(err);
    }
  },

  /* -----------------------------------------------------
      ADMIN: CREATE EVENT
  ----------------------------------------------------- */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // FILE SUPPORT (banner upload)
      const banner = req.file?.filename;

      const eventData = {
        ...req.body,
        banner
      };

      const created = await EventService.createEvent(eventData);

      res.json({
        success: true,
        message: "Event created successfully",
        data: created
      });
    } catch (err) {
      next(err);
    }
  },

  /* -----------------------------------------------------
      ADMIN: UPDATE EVENT
  ----------------------------------------------------- */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const eventData = {
        ...req.body,
        banner: req.file?.filename || req.body.banner
      };

      const updated = await EventService.updateEvent(id, eventData);

      res.json({
        success: true,
        message: "Event updated successfully",
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  /* -----------------------------------------------------
      ADMIN: UPDATE LIVESTREAM INFO
  ----------------------------------------------------- */
  updateLiveStream: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const { platform, url, thumbnail } = req.body;

      const updated = await EventService.updateLiveStream(id, {
        platform,
        url,
        thumbnail
      });

      res.json({
        success: true,
        message: "Livestream updated successfully",
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  /* -----------------------------------------------------
      ADMIN: DELETE EVENT
  ----------------------------------------------------- */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const deleted = await EventService.deleteEvent(id);

      res.json({
        success: true,
        message: "Event deleted successfully",
        data: deleted
      });
    } catch (err) {
      next(err);
    }
  }
};
