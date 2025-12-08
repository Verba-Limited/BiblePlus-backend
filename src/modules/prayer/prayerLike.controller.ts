import { Request, Response, NextFunction } from "express";
import { PrayerLikeService } from "./prayerLike.service";

export const PrayerLikeController = {
  pray: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { prayerId } = req.body;

      const data = await PrayerLikeService.pray(userId, prayerId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  unpray: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { prayerId } = req.body;

      const data = await PrayerLikeService.unpray(userId, prayerId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  status: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const prayerId = req.query.prayerId as string;

      const prayed = await PrayerLikeService.userPrayed(userId, prayerId);
      res.json({ success: true, prayed });
    } catch (err) {
      next(err);
    }
  },

  count: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const prayerId = req.params.prayerId;
      const count = await PrayerLikeService.count(prayerId);
      res.json({ success: true, count });
    } catch (err) {
      next(err);
    }
  }
};
