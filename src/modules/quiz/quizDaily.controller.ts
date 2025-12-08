import { Request, Response, NextFunction } from "express";
import { QuizDailyService } from "./quizDaily.service";
import { QuizService } from "./quiz.service";

export const QuizDailyController = {
  getDailyQuiz: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizDailyService.getDailyQuiz();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  submitDailyQuiz: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { answers, difficulty } = req.body;

      const result = QuizService.gradeQuiz(answers, difficulty || "easy");

      const streakData = await QuizDailyService.completeDailyQuiz(userId, answers);

      res.json({
        success: true,
        message: "Daily quiz submitted",
        score: result.score,
        correct: result.correct,
        total: result.total,
        previousDifficulty: result.previousDifficulty,
        newDifficulty: result.newDifficulty,
        streak: streakData.streak
      });
    } catch (err) {
      next(err);
    }
  }
};
