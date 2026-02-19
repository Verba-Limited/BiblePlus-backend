import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { QuizLeaderboardController } from "./quizLeaderboard.controller";

const router = Router();

/* ============================================
   PUBLIC LEADERBOARDS
============================================ */

// Global leaderboard
router.get(
  "/global",
  QuizLeaderboardController.getGlobal
);

// Weekly leaderboard
router.get(
  "/weekly",
  QuizLeaderboardController.getWeekly
);

/* ============================================
   AUTHENTICATED USER RANK
============================================ */

// My global rank
router.get(
  "/global/me",
  authMiddleware,
  QuizLeaderboardController.getMyGlobalRank
);

// My weekly rank
router.get(
  "/weekly/me",
  authMiddleware,
  QuizLeaderboardController.getMyWeeklyRank
);

export default router;