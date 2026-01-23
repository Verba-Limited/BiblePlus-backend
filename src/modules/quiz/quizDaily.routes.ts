import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { QuizDailyController } from "./quizDaily.controller";

const router = Router();

router.get("/", authMiddleware, QuizDailyController.getDaily);
router.post("/submit", authMiddleware, QuizDailyController.submit);

export default router;