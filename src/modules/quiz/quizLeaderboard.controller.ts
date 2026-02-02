import { Request, Response, NextFunction } from "express";
import { QuizLeaderboardService } from "./quizLeaderboard.service";
import {
  getToday,
  getWeekKey,
  getMonthKey
} from "./quizLeaderboard.utils";

export const QuizLeaderboardController = {
  /* =========================
     GLOBAL LEADERBOARD
     GET /api/quiz/leaderboard?limit=20
  ========================== */
  global: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = req.query.limit
        ? Number(req.query.limit)
        : 20;

      const data = await QuizLeaderboardService.getTop({
        type: "global",
        limit
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /* =========================
     DAILY LEADERBOARD
     GET /api/quiz/leaderboard/daily?date=YYYY-MM-DD
  ========================== */
  daily: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const date =
        typeof req.query.date === "string"
          ? req.query.date
          : getToday();

      const limit = req.query.limit
        ? Number(req.query.limit)
        : 20;

      const data = await QuizLeaderboardService.getTop({
        type: "daily",
        date,
        limit
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /* =========================
     WEEKLY LEADERBOARD
     GET /api/quiz/leaderboard/weekly
  ========================== */
  weekly: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizLeaderboardService.getTop({
        type: "weekly",
        week: getWeekKey()
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /* =========================
     MONTHLY LEADERBOARD
     GET /api/quiz/leaderboard/monthly
  ========================== */
  monthly: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizLeaderboardService.getTop({
        type: "monthly",
        month: getMonthKey()
      });

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};