import { Request, Response, NextFunction } from "express";
import { ProfileStatsService } from "./profile.stats.service";

export const ProfileStatsController = {
  getStats: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const stats = await ProfileStatsService.getStats(userId);

      res.json({
        success: true,
        data: stats,
      });
    } catch (err) {
      next(err);
    }
  },
};
