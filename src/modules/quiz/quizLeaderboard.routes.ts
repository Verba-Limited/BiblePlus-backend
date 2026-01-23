import { Router } from "express";
import { QuizLeaderboardController } from "./quizLeaderboard.controller";

const router = Router();

router.get("/", QuizLeaderboardController.getTop);

export default router;