import { Request, Response, NextFunction } from "express";
import AppError from "../../core/AppError";
import { QuizDailyService } from "./quizDaily.service";

export const QuizDailyController = {

  /* ============================================
     GET TODAY'S QUIZ
  ============================================ */
  getToday: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizDailyService.getToday();

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     GET QUIZ BY DATE
  ============================================ */
  getByDate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.params;

      const data = await QuizDailyService.getByDate(date);

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     ADMIN: OVERRIDE QUESTIONS FOR A DATE
  ============================================ */
  adminSetForDate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date, questions } = req.body;

      if (!date) {
        throw new AppError("Date is required", 400);
      }

      if (!Array.isArray(questions)) {
        throw new AppError("Questions must be an array", 400);
      }

      const data = await QuizDailyService.adminSetForDate(date, questions);

      res.status(201).json({
        success: true,
        message: `Quiz for ${date} has been set successfully`,
        data
      });

    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     ADMIN: ADD QUESTION TO POOL
  ============================================ */
  adminAddToPool: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { passage, options, correctAnswer, hint } = req.body;

      if (!passage || !options || !correctAnswer || !hint) {
        throw new AppError(
          "passage, options, correctAnswer and hint are required",
          400
        );
      }

      if (!Array.isArray(options)) {
        throw new AppError("Options must be an array", 400);
      }

      const data = await QuizDailyService.adminAddToPool({
        passage,
        options,
        correctAnswer,
        hint
      });

      res.status(201).json({
        success: true,
        message: "Question added to pool",
        data
      });

    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     GET POOL INFO
  ============================================ */
  getPoolInfo: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizDailyService.getPoolInfo();

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     HISTORY — last N admin-set quizzes
  ============================================ */
  history: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 30;

      const data = await QuizDailyService.history(limit);

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  }
};