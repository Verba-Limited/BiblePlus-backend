// src/modules/quiz/admin.quiz.routes.ts
import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { AdminQuizController } from "./admin.quiz.controller";

const router = Router();

router.post("/", authMiddleware, adminOnly, AdminQuizController.create);
router.post("/bulk", authMiddleware, adminOnly, AdminQuizController.bulkCreate);
router.put("/:id", authMiddleware, adminOnly, AdminQuizController.update);
router.patch("/:id/toggle", authMiddleware, adminOnly, AdminQuizController.toggle);
router.delete("/:id", authMiddleware, adminOnly, AdminQuizController.delete);

export default router;