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
| Base path (mounted in app.ts):
|   /api/admin/quiz
|
| Requirements:
|  - Valid JWT (authMiddleware)
|  - role === "admin" (adminOnly)
|--------------------------------------------------------------------------
*/

// 🔐 SECURITY: order matters
router.use(authMiddleware);
router.use(adminOnly);

/* ============================
   QUESTIONS MANAGEMENT
============================ */

// ➕ Create single question
// POST /api/admin/quiz/questions
router.post("/questions", AdminQuizController.create);

// ➕ Bulk create questions
// POST /api/admin/quiz/questions/bulk
router.post("/questions/bulk", AdminQuizController.bulkCreate);

// ✏️ Update question
// PUT /api/admin/quiz/questions/:id
router.put("/questions/:id", AdminQuizController.update);

// 🔁 Toggle active/inactive
// PATCH /api/admin/quiz/questions/:id/toggle
router.patch("/questions/:id/toggle", AdminQuizController.toggle);

// 🗑 Delete question
// DELETE /api/admin/quiz/questions/:id
router.delete("/questions/:id", AdminQuizController.delete);

export default router;