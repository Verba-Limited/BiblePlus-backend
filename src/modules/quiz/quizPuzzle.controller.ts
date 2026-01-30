import { Request, Response, NextFunction } from "express";
import { QuizPuzzleService } from "./quizPuzzle.service";

export const QuizPuzzleController = {
  /* =====================================================
     GET PUZZLES BY LEVEL
     GET /api/quiz/puzzle/level/:level
  ===================================================== */
  getByLevel: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const level = Number(req.params.level);

      const data = await QuizPuzzleService.getByLevel(level);

      res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     GET TODAY'S PUZZLE
     GET /api/quiz/puzzle/today
  ===================================================== */
  getToday: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const puzzle = await QuizPuzzleService.getToday();

      res.json({
        success: true,
        data: puzzle
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     GET PUZZLE BY DATE
     GET /api/quiz/puzzle/:date
     Format: YYYY-MM-DD
  ===================================================== */
  getByDate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.params;

      const puzzle = await QuizPuzzleService.getByDate(date);

      res.json({
        success: true,
        data: puzzle
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     GET PUZZLE HISTORY
     GET /api/quiz/puzzle/history
  ===================================================== */
  getHistory: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const history = await QuizPuzzleService.getHistory();

      res.json({
        success: true,
        data: history
      });
    } catch (err) {
      next(err);
    }
  }
};