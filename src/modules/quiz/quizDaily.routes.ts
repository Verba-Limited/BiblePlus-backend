import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
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


export default router;