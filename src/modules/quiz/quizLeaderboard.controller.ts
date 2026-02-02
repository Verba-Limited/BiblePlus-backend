import { Request, Response, NextFunction } from "express";
import { QuizLeaderboardService } from "./quizLeaderboard.service";
import {
  getToday,
  getWeekKey,
  getMonthKey
} from "./quizLeaderboard.utils";

export const QuizLeaderboardController = {
  global: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizLeaderboardService.getTop({
        type: "global"
      });
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  daily: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizLeaderboardService.getTop({
        type: "daily",
        date: getToday()
      });
      res.json({ success: true, data
       });
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