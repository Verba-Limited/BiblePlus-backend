import { Request, Response, NextFunction } from "express";
import { QuizService } from "./quiz.service";

export const QuizController = {
  play: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const level = Number(req.query.level);
      const data = await QuizService.play(req.userId!, level);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  submit: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { level, answers } = req.body;

      const result = await QuizService.submit(
        req.userId!,
        level,
        answers
      );

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  }
};