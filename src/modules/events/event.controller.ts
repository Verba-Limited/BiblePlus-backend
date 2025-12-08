import { Request, Response, NextFunction } from "express";
import { EventService } from "./event.service";

export const EventController = {
  // -----------------------------------------------------
  // GET EVENTS WITH FILTERS (category, etc.)
  // -----------------------------------------------------
  getEvents: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category } = req.query;

      const data = await EventService.getEvents({
        category: category ? String(category) : undefined
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // GET SINGLE EVENT
  // -----------------------------------------------------
  getEvent: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const data = await EventService.getEvent(id);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // UPCOMING EVENTS
  // -----------------------------------------------------
  upcoming: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await EventService.getUpcoming();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // PAST EVENTS
  // -----------------------------------------------------
  past: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await EventService.getPast();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // SEARCH EVENTS
  // -----------------------------------------------------
  search: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q as string;
      const data = await EventService.searchEvents(query);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // ADMIN: CREATE EVENT
  // -----------------------------------------------------
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await EventService.createEvent(req.body);

      res.json({
        success: true,
        message: "Event created successfully",
        data
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // ADMIN: UPDATE EVENT
  // -----------------------------------------------------
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const data = await EventService.updateEvent(id, req.body);

      res.json({
        success: true,
        message: "Event updated successfully",
        data
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // ADMIN: UPDATE LIVESTREAM INFORMATION
  // -----------------------------------------------------
  updateLiveStream: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { platform, url, thumbnail } = req.body;

      const updated = await EventService.updateLiveStream(req.params.id, {
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

  // -----------------------------------------------------
  // ADMIN: DELETE EVENT
  // -----------------------------------------------------
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      const data = await EventService.deleteEvent(id);

      res.json({
        success: true,
        message: "Event deleted successfully",
        data
      });
    } catch (err) {
      next(err);
    }
  }
};
