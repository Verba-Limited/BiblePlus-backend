import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { QuizDailyController } from "./quizDaily.controller";

const router = Router();

/* =====================================================
   DAILY QUIZ (EXTENDED)
===================================================== */

router.get(
  "/daily",
  authMiddleware,
  QuizDailyController.today
);

router.get(
  "/daily/yesterday",
  authMiddleware,
  QuizDailyController.yesterday
);

router.get(
  "/daily/history",
  authMiddleware,
  QuizDailyController.history
);

router.get(
  "/daily/:date",
  authMiddleware,
  QuizDailyController.byDate
);

export default router;