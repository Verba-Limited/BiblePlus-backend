import { Request, Response, NextFunction } from "express";
import AppError from "../../core/AppError";
import { QuizDailyService } from "./quizDaily.service";

export const QuizDailyController = {

  /* ============================================
     GET TODAY DAILY QUIZ
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
     ADMIN CREATE DAILY QUIZ
  ============================================ */
  adminCreate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date, questions, locked } = req.body;

      if (!date) {
        throw new AppError("Date is required", 400);
      }

      if (!Array.isArray(questions)) {
        throw new AppError("Questions must be an array", 400);
      }

      const data = await QuizDailyService.adminCreate(
        date,
        questions,
        locked
      );

      res.status(201).json({
        success: true,
        message: "Daily quiz created successfully",
        data
      });

    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     DAILY HISTORY
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