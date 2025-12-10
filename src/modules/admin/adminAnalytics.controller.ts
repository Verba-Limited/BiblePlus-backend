import { Request, Response, NextFunction } from "express";
import { AdminAnalyticsService } from "./adminAnalytics.service";

export const AdminAnalyticsController = {
  
  overview: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await AdminAnalyticsService.getOverview();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  activity: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await AdminAnalyticsService.getActivity();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  trending: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await AdminAnalyticsService.getTrending();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  systemHealth: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await AdminAnalyticsService.systemHealth();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }

};
