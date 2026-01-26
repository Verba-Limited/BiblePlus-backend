// src/modules/quiz/admin.quiz.routes.ts
import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { AdminQuizController } from "./admin.quiz.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| ADMIN QUIZ ROUTES
|--------------------------------------------------------------------------
| Mounted at: /api/admin/quiz
| Requirements:
|  - Valid JWT (authMiddleware)
|  - role === "admin" (adminOnly)
|--------------------------------------------------------------------------
*/

// ✅ Order matters — do not change
router.use(authMiddleware);
router.use(adminOnly);

/* ============================
   QUESTIONS MANAGEMENT
============================ */

// POST /api/admin/quiz/questions
router.post("/questions", AdminQuizController.create);

// POST /api/admin/quiz/questions/bulk
router.post("/questions/bulk", AdminQuizController.bulkCreate);

// PUT /api/admin/quiz/questions/:id
router.put("/questions/:id", AdminQuizController.update);

// PATCH /api/admin/quiz/questions/:id/toggle
router.patch("/questions/:id/toggle", AdminQuizController.toggle);

// DELETE /api/admin/quiz/questions/:id
router.delete("/questions/:id", AdminQuizController.delete);

export default router;