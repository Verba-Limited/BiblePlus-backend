import { Request, Response, NextFunction } from "express";
import { QuizPuzzleService } from "./quizPuzzle.service";

export const QuizPuzzleController = {
  getLevelPuzzles: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const level = Number(req.params.level);
      const data = await QuizPuzzleService.getByLevel(level);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};