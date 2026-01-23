import { Request, Response, NextFunction } from "express";
import { QuizDailyService } from "./quizDaily.service";

export const QuizDailyController = {
  getDaily: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const data = await QuizDailyService.getDailyQuiz(userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  submit: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const result = await QuizDailyService.submitDailyQuiz(
        userId,
        req.body.answers
      );
      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
};