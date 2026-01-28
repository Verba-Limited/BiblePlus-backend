import { Request, Response, NextFunction } from "express";
import { QuizLeaderboardService } from "./quizLeaderboard.service";

export const QuizLeaderboardController = {
  /* =====================================================
     GET GLOBAL LEADERBOARD
     GET /api/quiz/leaderboard
  ===================================================== */
  global: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit
        ? Number(req.query.limit)
        : 20;

      const leaderboard = await QuizLeaderboardService.top({
        type: "global",
        limit
      });

      res.json({
        success: true,
        data: leaderboard
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     GET DAILY LEADERBOARD
     GET /api/quiz/leaderboard/daily?date=YYYY-MM-DD
  ===================================================== */
  daily: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.query;

      if (!date || typeof date !== "string") {
        return res.status(400).json({
          success: false,
          message: "Date is required (YYYY-MM-DD)"
        });
      }

      const limit = req.query.limit
        ? Number(req.query.limit)
        : 20;

      const leaderboard = await QuizLeaderboardService.top({
        type: "daily",
        date,
        limit
      });

      res.json({
        success: true,
        data: leaderboard
      });
    } catch (err) {
      next(err);
    }
  }
};