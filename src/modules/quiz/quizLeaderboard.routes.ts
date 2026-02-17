// src/modules/quiz/quizLeaderboard.routes.ts

import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { QuizLeaderboardController } from "./quizLeaderboard.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| XP LEADERBOARD
|--------------------------------------------------------------------------
*/

// 🌍 Global ranking
router.get(
  "/",
  QuizLeaderboardController.global
);

// 👤 My rank
router.get(
  "/me",
  authMiddleware,
  QuizLeaderboardController.me
);

export default router;