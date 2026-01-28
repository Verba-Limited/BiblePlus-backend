import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { QuizLeaderboardController } from "./quizLeaderboard.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| QUIZ LEADERBOARD ROUTES
|--------------------------------------------------------------------------
| Mounted at: /api/quiz/leaderboard
| Auth required (users only)
|--------------------------------------------------------------------------
*/

router.use(authMiddleware);

// Global leaderboard
// GET /api/quiz/leaderboard
router.get("/", QuizLeaderboardController.global);

// Daily leaderboard
// GET /api/quiz/leaderboard/daily?date=YYYY-MM-DD
router.get("/daily", QuizLeaderboardController.daily);

export default router;