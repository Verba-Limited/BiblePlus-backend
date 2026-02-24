import { Request, Response, NextFunction } from "express";
import { QuizService } from "./quiz.service";
import AppError from "../../core/AppError";

export const QuizController = {
  play: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const level = Number(req.query.level);
      const data = await QuizService.play(req.userId!, level);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  submit: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { level, answers } = req.body;

      const result = await QuizService.submit(
        req.userId!,
        level,
        answers
      );

      res.json({ success: true, data: result });
    } catch (err) {
      next(err);
    }
  },

/* =====================================================
   COMPLETE LEVEL
   POST /api/quiz/complete
===================================================== */
complete: async (req: Request, res: Response, next: NextFunction) => {
  try {

    if (!req.userId) {
      throw new AppError("Unauthorized", 401);
    }

    const { level, mode, score } = req.body;

    const data = await QuizService.completeLevel(
      req.userId,
      Number(level),
      mode,
      Number(score)
    );

    res.json({
      success: true,
      message: data.completed
        ? "Level completed successfully"
        : "Score below required threshold",
      data
    });

  } catch (err) {
    next(err);
  }
}

};