import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { QuizDailyController } from "./quizDaily.controller";

const router = Router();

/* ============================================
   PUBLIC: GET TODAY'S QUIZ
============================================ */
router.get(
  "/today",
  QuizDailyController.getToday
);

/* ============================================
   PUBLIC: GET QUIZ BY DATE
============================================ */
router.get(
  "/date/:date",
  QuizDailyController.getByDate
);

/* ============================================
   PUBLIC: HISTORY
============================================ */
router.get(
  "/history",
  QuizDailyController.history
);

/* ============================================
   ADMIN: OVERRIDE QUIZ FOR A DATE
============================================ */
router.post(
  "/admin/set",
  authMiddleware,
  adminOnly,
  QuizDailyController.adminSetForDate
);

/* ============================================
   ADMIN: ADD QUESTION TO POOL
============================================ */
router.post(
  "/admin/pool/add",
  authMiddleware,
  adminOnly,
  QuizDailyController.adminAddToPool
);

/* ============================================
   ADMIN: GET POOL INFO
============================================ */
router.get(
  "/admin/pool/info",
  authMiddleware,
  adminOnly,
  QuizDailyController.getPoolInfo
);

export default router;