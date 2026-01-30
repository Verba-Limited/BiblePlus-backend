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

// ▶ Play quiz (normal | puzzle | level-based)
// GET /api/quiz/play?mode=normal&level=1
router.get("/play", authMiddleware, QuizController.play);

// ▶ Submit quiz answers
// POST /api/quiz/submit
router.post("/submit", authMiddleware, QuizController.submit);

/* =====================================================
   DAILY QUIZ
===================================================== */

// ▶ Get daily quiz
// GET /api/quiz/daily
router.get("/daily", authMiddleware, QuizController.daily);

// ▶ Submit daily quiz
// POST /api/quiz/daily/submit
router.post("/daily/submit", authMiddleware, QuizController.submitDaily);

/* =====================================================
   PUZZLES
===================================================== */

// ▶ Get puzzles by level
// GET /api/quiz/puzzle/level/1
router.get("/puzzle/level/:level", QuizPuzzleController.getByLevel);

// ▶ Get today's puzzle
// GET /api/quiz/puzzle/today
router.get("/puzzle/today", QuizPuzzleController.getToday);

// ▶ Get puzzle history
// GET /api/quiz/puzzle/history
router.get("/puzzle/history", QuizPuzzleController.getHistory);

// ▶ Get puzzle by date (YYYY-MM-DD)
// GET /api/quiz/puzzle/2026-01-28
router.get("/puzzle/:date", QuizPuzzleController.getByDate);

/* =====================================================
   LEADERBOARD
===================================================== */

// ▶ Global leaderboard (normal + daily combined)
// GET /api/quiz/leaderboard
router.get("/leaderboard", QuizLeaderboardController.top);

// ▶ Daily leaderboard only
// GET /api/quiz/leaderboard/daily
router.get("/leaderboard/daily", QuizLeaderboardController.daily);

/* =====================================================
   ADMIN QUIZ ROUTES (QUESTIONS MANAGEMENT)
   Protected by auth + adminOnly
===================================================== */

// ▶ Create single question
// POST /api/quiz/admin/questions
router.post(
  "/admin/questions",
  authMiddleware,
  adminOnly,
  AdminQuizController.create
);

// ▶ Bulk create questions
// POST /api/quiz/admin/questions/bulk
router.post(
  "/admin/questions/bulk",
  authMiddleware,
  adminOnly,
  AdminQuizController.bulkCreate
);

// ▶ Update question
// PUT /api/quiz/admin/questions/:id
router.put(
  "/admin/questions/:id",
  authMiddleware,
  adminOnly,
  AdminQuizController.update
);

// ▶ Toggle question active/inactive
// PATCH /api/quiz/admin/questions/:id/toggle
router.patch(
  "/admin/questions/:id/toggle",
  authMiddleware,
  adminOnly,
  AdminQuizController.toggle
);

// ▶ Delete question
// DELETE /api/quiz/admin/questions/:id
router.delete(
  "/admin/questions/:id",
  authMiddleware,
  adminOnly,
  AdminQuizController.delete
);

export default router;