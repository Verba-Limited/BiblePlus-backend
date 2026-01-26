// src/modules/quiz/admin.quiz.routes.ts
import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { AdminQuizController } from "./admin.quiz.controller";

const router = Router();

/* ============================
   ADMIN QUIZ ROUTES
   /api/admin/quiz
============================ */

router.use(authMiddleware);
router.use(adminOnly);

// Create single question
router.post("/questions", AdminQuizController.create);

// Bulk create questions
router.post("/questions/bulk", AdminQuizController.bulkCreate);

// Update question
router.put("/questions/:id", AdminQuizController.update);

// Toggle active/inactive
router.patch("/questions/:id/toggle", AdminQuizController.toggle);

// Delete question
router.delete("/questions/:id", AdminQuizController.delete);

export default router;