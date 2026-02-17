import { Router } from "express";
import { QuizDailyController } from "./quizDaily.controller";
import authMiddleware from "../../middleware/auth.middleware";

const router = Router();

/*
|--------------------------------------------------------------------------
| DAILY QUIZ ROUTES
|--------------------------------------------------------------------------
| Base: /api/quiz/daily
|--------------------------------------------------------------------------
*/

// GET today's AI-generated quiz
router.get("/today", authMiddleware, QuizDailyController.today);

// GET history
router.get("/history", authMiddleware, QuizDailyController.history);

export default router;