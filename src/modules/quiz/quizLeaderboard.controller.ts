import { Request, Response, NextFunction } from "express";
import { QuizLeaderboardService } from "./quizLeaderboard.service";
import {
  getToday,
  getWeekKey,
  getMonthKey
} from "./quizLeaderboard.utils";

export const QuizLeaderboardController = {
  global: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 20;

      const data = await QuizLeaderboardService.getTop({
        type: "global",
        limit
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  daily: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 20;
      const date =
        typeof req.query.date === "string"
          ? req.query.date
          : getToday();

      const data = await QuizLeaderboardService.getTop({
        type: "daily",
        date,
        limit
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  weekly: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizLeaderboardService.getTop({
        type: "weekly",
        week: getWeekKey()
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  monthly: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizLeaderboardService.getTop({
        type: "monthly",
        month: getMonthKey()
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};