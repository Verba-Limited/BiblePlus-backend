import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { QuizLeaderboardController } from "./quizLeaderboard.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| QUIZ LEADERBOARD ROUTES
|--------------------------------------------------------------------------
| Base: /api/quiz/leaderboard
|--------------------------------------------------------------------------
*/

// 🌍 Global leaderboard
// GET /api/quiz/leaderboard?limit=20
router.get(
  "/",
  authMiddleware,
  QuizLeaderboardController.global
);

// 📅 Daily leaderboard
// GET /api/quiz/leaderboard/daily?date=YYYY-MM-DD&limit=20
router.get(
  "/daily",
  authMiddleware,
  QuizLeaderboardController.daily

  
);

/* =====================================================
   LEADERBOARDS
===================================================== */

router.get("/leaderboard", QuizLeaderboardController.global);
router.get("/leaderboard/daily", QuizLeaderboardController.daily);
router.get("/leaderboard/weekly", QuizLeaderboardController.weekly);
router.get("/leaderboard/monthly", QuizLeaderboardController.monthly);

export default router;