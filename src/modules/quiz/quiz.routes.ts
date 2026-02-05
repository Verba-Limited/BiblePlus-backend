// src/modules/quiz/quiz.routes.ts
import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";

import { QuizController } from "./quiz.controller";
import { AdminQuizController } from "./admin.quiz.controller";
import { QuizPuzzleController } from "./quizPuzzle.controller";
import { QuizLeaderboardController } from "./quizLeaderboard.controller";

const router = Router();

/* =====================================================
   USER QUIZ ROUTES
   Base: /api/quiz
===================================================== */

// ▶ Play normal / puzzle quiz
// GET /api/quiz/play?mode=normal&level=1
router.get("/play", authMiddleware, QuizController.play);

// ▶ Submit normal / puzzle quiz
// POST /api/quiz/submit
router.post("/submit", authMiddleware, QuizController.submit);

/* =====================================================
   DAILY QUIZ
===================================================== */

// ▶ Get TODAY’s daily quiz
// GET /api/quiz/daily/today
router.get(
  "/daily/today",
  authMiddleware,
  QuizController.dailyToday
);

// ▶ List ALL available daily quiz dates
// GET /api/quiz/daily/dates
router.get(
  "/daily/dates",
  authMiddleware,
  QuizController.dailyDates
);

// ▶ Submit TODAY’s daily quiz
// POST /api/quiz/daily/submit
router.post(
  "/daily/submit",
  authMiddleware,
  QuizController.submitDaily
);

// ▶ Get daily quiz by date (past or today)
// GET /api/quiz/daily/2026-01-15
router.get(
  "/daily/:date",
  authMiddleware,
  QuizController.dailyByDate
);

/* =====================================================
   PUZZLES
===================================================== */

// ▶ Get puzzles by level
// GET /api/quiz/puzzle/level/1
router.get(
  "/puzzle/level/:level",
  authMiddleware,
  QuizPuzzleController.getByLevel
);

// ▶ Get today’s puzzle
// GET /api/quiz/puzzle/today
router.get(
  "/puzzle/today",
  authMiddleware,
  QuizPuzzleController.getToday
);

// ▶ Puzzle history
// GET /api/quiz/puzzle/history
router.get(
  "/puzzle/history",
  authMiddleware,
  QuizPuzzleController.getHistory
);

// ▶ Get puzzle by date
// GET /api/quiz/puzzle/2026-01-28
router.get(
  "/puzzle/:date",
  authMiddleware,
  QuizPuzzleController.getByDate
);

/* =====================================================
   LEADERBOARD
===================================================== */

// ▶ Global leaderboard
// GET /api/quiz/leaderboard?limit=20
router.get(
  "/leaderboard",
  authMiddleware,
  QuizLeaderboardController.global
);

// ▶ Daily leaderboard
// GET /api/quiz/leaderboard/daily?date=YYYY-MM-DD
router.get(
  "/leaderboard/daily",
  authMiddleware,
  QuizLeaderboardController.daily
);

export default router;