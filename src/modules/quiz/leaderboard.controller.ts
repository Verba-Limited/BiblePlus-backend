import { LeaderboardService } from "./leaderboard.service";
import { Request, Response, NextFunction } from "express";

export const LeaderboardController = {
  getTopScores: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await LeaderboardService.getTop();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};
