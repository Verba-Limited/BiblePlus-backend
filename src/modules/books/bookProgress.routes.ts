import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { BookProgressController } from "./bookProgress.controller";

const router = Router();

router.post("/update", authMiddleware, BookProgressController.update);
router.get("/:bookId", authMiddleware, BookProgressController.get);

export default router;
 