import { Request, Response, NextFunction } from "express";
import { EventService } from "./event.service";
import AppError from "../../core/AppError";
import { EventReminder } from "./eventReminder.model";
import { NotificationService } from "../notifications/notification.service";
import { readSearchTerm, sanitizeUpdate } from "../../utils/sanitize";

/* Shared response shape.
   `data` stays a plain array — that is what the existing clients
   already read — with the paging metadata alongside it. */
const listResponse = (res: Response, result: any, extra: any = {}) =>
  res.json({
    success: true,
    count: result.events.length,
    total: result.pagination.total,
    pagination: result.pagination,
    data: result.events,
    ...extra
  });

/* Pull the common list filters out of a query string. */
const listFilters = (req: Request) => ({
  category: req.query.category ? String(req.query.category) : undefined,
  page: req.query.page,
  limit: req.query.limit,
  search: readSearchTerm(req.query as any) || undefined
});

export const EventController = {
  /* -----------------------------------------------------
      PUBLIC: GET EVENTS WITH FILTERS
  ----------------------------------------------------- */
  getEvents: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status ? String(req.query.status) : undefined;

      const result = await EventService.getEvents({
        ...listFilters(req),
        status
      });

      listResponse(res, result);
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
      const result = await EventService.getUpcoming(listFilters(req));
      listResponse(res, result);
    } catch (err) {
      next(err);
    }
  },

  /* -----------------------------------------------------
      PUBLIC: PAST EVENTS
  ----------------------------------------------------- */
  past: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await EventService.getPast(listFilters(req));
      listResponse(res, result);
    } catch (err) {
      next(err);
    }
  },

  /* -----------------------------------------------------
      PUBLIC: SEARCH EVENTS
  ----------------------------------------------------- */
  search: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Accept ?q= , ?search= or ?query= — the portal and the app
      // each used a different name, and the unmatched one arrived
      // as undefined and crashed the regex query.
      const term = readSearchTerm(req.query as any);
      const status = req.query.status ? String(req.query.status) : undefined;

      const result = await EventService.searchEvents(term, {
        category: req.query.category ? String(req.query.category) : undefined,
        page: req.query.page,
        limit: req.query.limit,
        status
      });

      listResponse(res, result, { query: term });
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
        userId: req.userId,
        eventId: eventId
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
      const eventData = sanitizeUpdate({
        ...req.body,
        banner: req.file?.filename || req.body.banner
      });

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
