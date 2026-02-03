import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { QuizLeaderboardController } from "./quizLeaderboard.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| LEADERBOARD ROUTES
| Base: /api/quiz/leaderboard
|--------------------------------------------------------------------------
*/

// 🌍 Global
router.get("/", authMiddleware, QuizLeaderboardController.global);

// 📅 Daily
router.get("/daily", authMiddleware, QuizLeaderboardController.daily);

// 📆 Weekly
router.get("/weekly", authMiddleware, QuizLeaderboardController.weekly);

// 🗓 Monthly
router.get("/monthly", authMiddleware, QuizLeaderboardController.monthly);

export default router;