import { Request, Response, NextFunction } from "express";
import { PrayerService } from "./prayer.service";

export const PrayerController = {
  // CREATE PRAYER REQUEST
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const data = await PrayerService.create({
        ...req.body,
        userId,
        image: req.file?.filename || ""
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // PUBLIC PRAYER WALL (with prayCount + userPrayed)
  getPublic: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20 } = req.query;

      // @ts-ignore - get logged in userId (optional)
      const userId = req.userId || null;

      const data = await PrayerService.getPublic(
        Number(page),
        Number(limit),
        userId
      );

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // GET CURRENT USER'S PRAYER REQUESTS
  getUserRequests: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const data = await PrayerService.getUserRequests(userId);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // ADMIN: APPROVE REQUEST
  approve: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await PrayerService.approve(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // ADMIN: MARK AS ANSWERED
  markAnswered: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await PrayerService.markAnswered(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};
