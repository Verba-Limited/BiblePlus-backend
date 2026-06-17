import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { QuizController } from "./quiz.controller";

const router = Router();

router.get("/play", authMiddleware, QuizController.play);
router.post("/submit", authMiddleware, QuizController.submit);


router.post(
  "/complete",
  authMiddleware,
  QuizController.complete
);

export default router;