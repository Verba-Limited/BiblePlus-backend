import { Request, Response, NextFunction } from "express";
import { QuizService } from "./quiz.service";

export const QuizController = {
  // -------------------------------------------------------------
  // GET QUESTIONS (supports difficulty + category + amount)
  // -------------------------------------------------------------
  getQuestions: (req: Request, res: Response, next: NextFunction) => {
    try {
      const amount = Number(req.query.amount) || 10;
      const category = (req.query.category as string) || "";
      const difficulty = (req.query.difficulty as string) || "";

      const questions = QuizService.getQuestions(amount, category, difficulty);

      res.json({
        success: true,
        data: {
          questions,
          settings: {
            amount,
            category,
            difficulty,
            timer: 30 // frontend timer usage
          }
        }
      });
    } catch (err) {
      next(err);
    }
  },

  // -------------------------------------------------------------
  // GRADE QUIZ (supports difficulty progression)
  // -------------------------------------------------------------
  gradeQuiz: (req: Request, res: Response, next: NextFunction) => {
    try {
      const { answers, difficulty } = req.body;

      if (!Array.isArray(answers) || answers.length === 0) {
        return res.status(400).json({
          success: false,
          message: "Answers array is required"
        });
      }

      const result = QuizService.gradeQuiz(
        answers,
        difficulty || "easy"
      );

      res.json({
        success: true,
        data: result,
        message: "Quiz graded successfully"
      });
    } catch (err) {
      next(err);
    }
  }
};
