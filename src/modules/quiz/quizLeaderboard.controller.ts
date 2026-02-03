// src/modules/quiz/quizLeaderboard.controller.ts

import { Request, Response, NextFunction } from "express";
import { QuizLeaderboardService } from "./quizLeaderboard.service";
import {
  getToday,
  getWeekKey,
  getMonthKey
} from "./quizLeaderboard.utils";

export const QuizLeaderboardController = {
  /* =====================================================
     GLOBAL LEADERBOARD
     GET /api/quiz/leaderboard?limit=20
  ===================================================== */
  global: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 20;

      const data = await QuizLeaderboardService.getTop({
        type: "global",
        limit
      });

      return res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     DAILY LEADERBOARD
     GET /api/quiz/leaderboard/daily?date=YYYY-MM-DD&limit=20
  ===================================================== */
  daily: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const date =
        typeof req.query.date === "string"
          ? req.query.date
          : getToday();

      const limit = Number(req.query.limit) || 20;

      const data = await QuizLeaderboardService.getTop({
        type: "daily",
        date,
        limit
      });

      return res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     WEEKLY LEADERBOARD
     GET /api/quiz/leaderboard/weekly?limit=20
  ===================================================== */
  weekly: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 20;

      const data = await QuizLeaderboardService.getTop({
        type: "weekly",
        week: getWeekKey(),
        limit
      });

      return res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     MONTHLY LEADERBOARD
     GET /api/quiz/leaderboard/monthly?limit=20
  ===================================================== */
  monthly: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 20;

      const data = await QuizLeaderboardService.getTop({
        type: "monthly",
        month: getMonthKey(),
        limit
      });

      return res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }
};