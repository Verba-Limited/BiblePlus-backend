import { Request, Response, NextFunction } from "express";
import { QuizService } from "./quiz.service";
import AppError from "../../core/AppError";

export const QuizController = {

  /* =========================================================
        GET QUIZ QUESTIONS 
        Supports: amount, category, difficulty
  ========================================================= */
  getQuestions: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const amount = Number(req.query.amount) || 10;
      const category = (req.query.category as string) || "";
      const difficulty = (req.query.difficulty as string) || "easy";

      if (!["easy", "medium", "hard"].includes(difficulty)) {
        throw new AppError("Invalid difficulty level", 400);
      }

      const questions = await QuizService.getQuestions(amount, category, difficulty);

      return res.json({
        success: true,
        data: {
          questions,
          settings: {
            amount,
            category,
            difficulty,
            timer: 30
          }
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /* =========================================================
        GRADE QUIZ 
        Supports difficulty progression
  ========================================================= */
  gradeQuiz: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answers, difficulty } = req.body;

      if (!Array.isArray(answers) || answers.length === 0) {
        throw new AppError("Answers array is required", 400);
      }

      const level = difficulty || "easy";

      if (!["easy", "medium", "hard"].includes(level)) {
        throw new AppError("Invalid difficulty level", 400);
      }

      // Call service
      const result = await QuizService.gradeQuiz(answers, level);

      return res.json({
        success: true,
        message: "Quiz graded successfully",
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
};
