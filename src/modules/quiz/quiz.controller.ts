import { Request, Response, NextFunction } from "express";
import { QuizService } from "./quiz.service";
import AppError from "../../core/AppError";

export const QuizController = {
  /* =====================================================
     PLAY QUIZ (NORMAL / PUZZLE / LEVEL)
     GET /api/quiz/play?mode=&level=
  ===================================================== */
  play: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const mode = String(req.query.mode || "");
      const level = Number(req.query.level);

      if (!mode) {
        throw new AppError("Quiz mode is required", 400);
      }

      if (!level || level < 1) {
        throw new AppError("Valid quiz level is required", 400);
      }

      const data = await QuizService.play(mode as any, level);

      res.status(200).json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     SUBMIT QUIZ (NORMAL / PUZZLE)
     POST /api/quiz/submit
  ===================================================== */
  submit: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // injected by auth middleware
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

      res.status(200).json({
        success: true,
        message: "Quiz submitted successfully",
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     GET DAILY QUIZ
     GET /api/quiz/daily
  ===================================================== */
  daily: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId: string = req.userId;

      const data = await QuizService.daily(userId);

      res.status(200).json({
        success: true,
        data
      });
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

      const data = await QuizService.submitDaily(userId, answers);

      res.status(200).json({
        success: true,
        message: "Daily quiz submitted",
        data
      });
    } catch (err) {
      next(err);
    }
  }
};