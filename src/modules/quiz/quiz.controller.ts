// src/modules/quiz/quiz.controller.ts
import { Request, Response, NextFunction } from "express";
import { QuizService } from "./quiz.service";
import AppError from "../../core/AppError";

export const QuizController = {
  /* =====================================================
     PLAY QUIZ (NORMAL / PUZZLE)
     GET /api/quiz/play?mode=normal&level=1
  ===================================================== */
  play: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mode = String(req.query.mode || "");
      const level = Number(req.query.level);

      if (!mode) {
        throw new AppError("Quiz mode is required", 400);
      }

      if (!Number.isInteger(level) || level < 1 || level > 10) {
        throw new AppError("Quiz level must be between 1 and 10", 400);
      }

      const data = await QuizService.play(mode as any, level);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     SUBMIT NORMAL / PUZZLE QUIZ
     POST /api/quiz/submit
  ===================================================== */
  submit: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId: string = req.userId;

      const { mode, level, answers } = req.body;

      if (!mode || !level || !Array.isArray(answers)) {
        throw new AppError("mode, level and answers are required", 400);
      }

      const data = await QuizService.submit(userId, {
        mode,
        level: Number(level),
        answers
      });

      res.json({
        success: true,
        message: "Quiz submitted successfully",
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     GET TODAY'S DAILY QUIZ
     GET /api/quiz/daily/today
  ===================================================== */
  dailyToday: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId: string = req.userId;

      const data = await QuizService.dailyToday(userId);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     LIST AVAILABLE DAILY QUIZ DATES
     GET /api/quiz/daily/dates
  ===================================================== */
  dailyDates: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizService.dailyDates();

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     GET DAILY QUIZ BY DATE (READ-ONLY)
     GET /api/quiz/daily/:date
  ===================================================== */
  dailyByDate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date } = req.params;

      if (!date) {
        throw new AppError("Date parameter is required", 400);
      }

      // ❗ DO NOT pass userId here (history must be viewable)
      const data = await QuizService.dailyByDate(date);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     SUBMIT DAILY QUIZ
     POST /api/quiz/daily/submit
  ===================================================== */
  submitDaily: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId: string = req.userId;

      const { answers } = req.body;

      if (!Array.isArray(answers) || answers.length === 0) {
        throw new AppError("Answers array is required", 400);
      }

      const data = await QuizService.submitDaily({
        userId,
        answers
      });

      res.json({
        success: true,
        message: "Daily quiz submitted successfully",
        data
      });
    } catch (err) {
      next(err);
    }
  }
};