import { LeaderboardService } from "./leaderboard.service";
import { Request, Response, NextFunction } from "express";

export const LeaderboardController = {
  getTopScores: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 20;
      const category = req.query.category as string | undefined;

      const data = await LeaderboardService.getTop(limit, category);

      res.json({
        success: true,
        count: data.length,
        data
      });
    } catch (err) {
      next(err);
    }
  }
};
