import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { QuizAdminController } from "./quiz.admin.controller";

const router = Router();

router.use(authMiddleware, adminOnly);

router.post("/", QuizAdminController.create);
router.get("/", QuizAdminController.all);
router.put("/:id", QuizAdminController.update);
router.delete("/:id", QuizAdminController.delete);

export default router;