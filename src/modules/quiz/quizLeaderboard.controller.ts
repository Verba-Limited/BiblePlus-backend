// src/modules/quiz/quizLeaderboard.controller.ts

import { Request, Response, NextFunction } from "express";
import { QuizLeaderboardService } from "./quizLeaderboard.service";
import AppError from "../../core/AppError";

export const QuizLeaderboardController = {

  /* ============================================
     GET GLOBAL LEADERBOARD
     GET /api/quiz/leaderboard
  ============================================ */
  global: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 50;

      const data = await QuizLeaderboardService.getGlobal(limit);

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     GET CURRENT USER RANK
     GET /api/quiz/leaderboard/me
  ============================================ */
  me: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401);
      }

      const data = await QuizLeaderboardService.getUserRank(req.userId);

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  }
};