// src/modules/quiz/quizLeaderboard.controller.ts

import { Request, Response, NextFunction } from "express";
import { QuizLeaderboardService } from "./quizLeaderboard.service";

export const QuizLeaderboardController = {
  /* =====================================================
     GET GLOBAL LEADERBOARD
     GET /api/quiz/leaderboard?limit=20
  ===================================================== */
  global: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit =
        typeof req.query.limit === "string"
          ? Number(req.query.limit)
          : 20;

      const leaderboard = await QuizLeaderboardService.top({
        type: "global",
        limit
      });

      res.status(200).json({
        success: true,
        data: leaderboard
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     GET DAILY LEADERBOARD
     GET /api/quiz/leaderboard/daily?date=YYYY-MM-DD&limit=20
  ===================================================== */
  daily: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const date =
        typeof req.query.date === "string"
          ? req.query.date
          : null;

      if (!date) {
        return res.status(400).json({
          success: false,
          message: "date query param is required (YYYY-MM-DD)"
        });
      }

      const limit =
        typeof req.query.limit === "string"
          ? Number(req.query.limit)
          : 20;

      const leaderboard = await QuizLeaderboardService.top({
        type: "daily",
        date,
        limit
      });

      res.status(200).json({
        success: true,
        data: leaderboard
      });
    } catch (err) {
      next(err);
    }
  }
};