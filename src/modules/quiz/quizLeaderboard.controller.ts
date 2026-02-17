import { Request, Response, NextFunction } from "express";
import { QuizLeaderboardService } from "./quizLeaderboard.service";
import AppError from "../../core/AppError";

export const QuizLeaderboardController = {

  /* ============================================
     GLOBAL LEADERBOARD
     GET /api/quiz/leaderboard/global
  ============================================ */
  async getGlobal(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 50;

      const data = await QuizLeaderboardService.getGlobal(limit);

      res.json({
        success: true,
        type: "global",
        count: data.length,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     WEEKLY LEADERBOARD
     GET /api/quiz/leaderboard/weekly
  ============================================ */
  async getWeekly(req: Request, res: Response, next: NextFunction) {
    try {
      const limit = Number(req.query.limit) || 50;

      const data = await QuizLeaderboardService.getWeekly(limit);

      res.json({
        success: true,
        type: "weekly",
        count: data.length,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     GET CURRENT USER GLOBAL RANK
     GET /api/quiz/leaderboard/global/me
  ============================================ */
  async getMyGlobalRank(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401);
      }

      const data = await QuizLeaderboardService.getUserGlobalRank(
        req.userId
      );

      res.json({
        success: true,
        type: "global",
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     GET CURRENT USER WEEKLY RANK
     GET /api/quiz/leaderboard/weekly/me
  ============================================ */
  async getMyWeeklyRank(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401);
      }

      const data = await QuizLeaderboardService.getUserWeeklyRank(
        req.userId
      );

      res.json({
        success: true,
        type: "weekly",
        data
      });
    } catch (err) {
      next(err);
    }
  }
};