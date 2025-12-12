import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { QuizController } from "./quiz.controller";
import { QuizDailyController } from "./quizDaily.controller";
import { LeaderboardController } from "./leaderboard.controller";

const router = Router();

/* ===========================
        NORMAL QUIZ
=========================== */
router.get("/questions", QuizController.getQuestions);

// Optional: require auth to grade
// router.post("/grade", authMiddleware, QuizController.gradeQuiz);
router.post("/grade", QuizController.gradeQuiz);

/* ===========================
        DAILY QUIZ
=========================== */
router.get("/daily", authMiddleware, QuizDailyController.getDailyQuiz);
router.post(
  "/daily/submit",
  authMiddleware,
  QuizDailyController.submitDailyQuiz
);

/* ===========================
        LEADERBOARD
=========================== */
router.get("/leaderboard", LeaderboardController.getTopScores);

export default router;
