import { Request, Response, NextFunction } from "express";
import { QuizLeaderboardService } from "./quizLeaderboard.service";

export const QuizLeaderboardController = {
  getTop: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 20;
      const data = await QuizLeaderboardService.top(limit);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};