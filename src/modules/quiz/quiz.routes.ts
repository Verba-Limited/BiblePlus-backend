import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { QuizController } from "./quiz.controller";
import { adminOnly } from "../../middleware/admin.middleware";
import { QuizAdminController } from "./quizAdmin.controller";

const router = Router();

router.get("/play", authMiddleware, QuizController.play);
router.post("/submit", authMiddleware, QuizController.submit);

router.post(
  "/admin/add",
  authMiddleware,
  adminOnly,
  QuizAdminController.add
);

router.post(
  "/admin/bulk",
  authMiddleware,
  adminOnly,
  QuizAdminController.bulkAdd
);

router.put(
  "/admin/deactivate/:id",
  authMiddleware,
  adminOnly,
  QuizAdminController.deactivate
)

export default router;