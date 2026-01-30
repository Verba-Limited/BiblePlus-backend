import { Request, Response, NextFunction } from "express";
import { QuizDailyService } from "./quizDaily.service";

export const QuizDailyController = {
  // GET /api/quiz/daily
  today: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const quiz = await QuizDailyService.today();
      res.json({ success: true, data: quiz });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/quiz/daily/yesterday
  yesterday: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const quiz = await QuizDailyService.yesterday();
      res.json({ success: true, data: quiz });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/quiz/daily/history
  history: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit =
        typeof req.query.limit === "string"
          ? Number(req.query.limit)
          : 30;

      const history = await QuizDailyService.history(limit);

      res.json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  },

  // GET /api/quiz/daily/:date
  byDate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.params;

      const quiz = await QuizDailyService.getByDate(date);

      res.json({ success: true, data: quiz });
    } catch (err) {
      next(err);
    }
  }
};