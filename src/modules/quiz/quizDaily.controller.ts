import { Request, Response, NextFunction } from "express";
import { QuizDailyService } from "./quizDaily.service";
import { QuizService, UserAnswer } from "./quiz.service";

export const QuizDailyController = {
  // -------------------------------------------------------------
  // GET TODAY'S QUIZ
  // -------------------------------------------------------------
  getDailyQuiz: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const quiz = await QuizDailyService.getDailyQuiz();

      res.json({
        success: true,
        data: quiz
      });
    } catch (err) {
      next(err);
    }
  },

  // -------------------------------------------------------------
  // SUBMIT TODAY'S QUIZ
  // -------------------------------------------------------------
  submitDailyQuiz: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId: string = req.userId;

      const { answers, difficulty } = req.body;

      if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Answers array is required"
        });
      }

      const typedAnswers = answers as UserAnswer[];

      // Grade quiz
      const result = QuizService.gradeQuiz(typedAnswers, difficulty || "easy");

      // Process streak + completion
      const streakInfo = await QuizDailyService.completeDailyQuiz(
        userId,
        typedAnswers
      );

      res.json({
        success: true,
        message: "Daily quiz submitted",
        score: result.score,
        correct: result.correct,
        total: result.total,
        previousDifficulty: result.previousDifficulty,
        newDifficulty: result.newDifficulty,
        streak: streakInfo.streak,
        completedAt: streakInfo.lastCompleted
      });
    } catch (err) {
      next(err);
    }
  }
};
