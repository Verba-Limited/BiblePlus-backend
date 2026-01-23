// src/modules/quiz/quiz.routes.ts
import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { QuizController } from "./quiz.controller";
import { AdminQuizController } from "./admin.quiz.controller";

const router = Router();

/* =====================================================
   USER QUIZ ROUTES
===================================================== */

// ▶ Play quiz (general / puzzle / level-based)
// GET /api/quiz/play?mode=general&level=1
router.get("/play", authMiddleware, QuizController.play);

// ▶ Submit quiz answers
// POST /api/quiz/submit
router.post("/submit", authMiddleware, QuizController.submit);

// ▶ Get daily quiz
// GET /api/quiz/daily
router.get("/daily", authMiddleware, QuizController.daily);

// ▶ Submit daily quiz
// POST /api/quiz/daily/submit
router.post("/daily/submit", authMiddleware, QuizController.submitDaily);

/* =====================================================
   ADMIN QUIZ ROUTES (QUESTIONS MANAGEMENT)
===================================================== */

// ▶ Create a question
// POST /api/quiz/admin
router.post("/admin", authMiddleware, adminOnly, AdminQuizController.create);

// ▶ Bulk create questions
// POST /api/quiz/admin/bulk
router.post(
  "/admin/bulk",
  authMiddleware,
  adminOnly,
  AdminQuizController.bulkCreate
);

// ▶ Update question
// PUT /api/quiz/admin/:id
router.put(
  "/admin/:id",
  authMiddleware,
  adminOnly,
  AdminQuizController.update
);

// ▶ Enable / Disable question
// PATCH /api/quiz/admin/:id/toggle
router.patch(
  "/admin/:id/toggle",
  authMiddleware,
  adminOnly,
  AdminQuizController.toggle
);

// ▶ Delete question
// DELETE /api/quiz/admin/:id
router.delete(
  "/admin/:id",
  authMiddleware,
  adminOnly,
  AdminQuizController.delete
);

export default router;