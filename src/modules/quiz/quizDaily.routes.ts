import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { QuizDailyController } from "./quizDaily.controller";

const router = Router();

/* ============================================
   PUBLIC: GET TODAY QUIZ
============================================ */
router.get(
  "/today",
  QuizDailyController.getToday
);

/* ============================================
   ADMIN: CREATE DAILY QUIZ
============================================ */
router.post(
  "/admin/create",
  authMiddleware,
  adminOnly,
  QuizDailyController.adminCreate
);

/* ============================================
   HISTORY
============================================ */
router.get(
  "/history",
  QuizDailyController.history
);

export default router;