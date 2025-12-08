import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { QuizController } from "./quiz.controller";
import { QuizDailyController } from "./quizDaily.controller";
import { LeaderboardController } from "./leaderboard.controller";

const router = Router();

// Normal quiz
router.get("/questions", QuizController.getQuestions);
router.post("/grade", QuizController.gradeQuiz);

// Daily Quiz
router.get("/daily", authMiddleware, QuizDailyController.getDailyQuiz);
router.post("/daily/submit", authMiddleware, QuizDailyController.submitDailyQuiz);

// Leaderboard
router.get("/leaderboard", LeaderboardController.getTopScores);

export default router;
