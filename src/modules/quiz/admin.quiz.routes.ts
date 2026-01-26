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
| All routes require:
|  - Authenticated user
|  - Admin role
|--------------------------------------------------------------------------
*/

router.use(authMiddleware);
router.use(adminOnly);

/* ============================
   QUESTIONS MANAGEMENT
============================ */

// Create a single question
// POST /api/admin/quiz/questions
router.post("/questions", AdminQuizController.create);

// Bulk create questions
// POST /api/admin/quiz/questions/bulk
router.post("/questions/bulk", AdminQuizController.bulkCreate);

// Update a question
// PUT /api/admin/quiz/questions/:id
router.put("/questions/:id", AdminQuizController.update);

// Toggle active / inactive
// PATCH /api/admin/quiz/questions/:id/toggle
router.patch("/questions/:id/toggle", AdminQuizController.toggle);

// Delete a question
// DELETE /api/admin/quiz/questions/:id
router.delete("/questions/:id", AdminQuizController.delete);

export default router;