import { Request, Response, NextFunction } from "express";
import { QuizDailyService } from "./quizDaily.service";

export const QuizDailyController = {
  today: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizDailyService.getToday();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  history: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizDailyService.history();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};