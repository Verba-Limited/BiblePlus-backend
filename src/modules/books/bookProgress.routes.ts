import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { BookProgressController } from "./bookProgress.controller";

const router = Router();

// Update reading progress
router.post("/update", authMiddleware, BookProgressController.update);

// Get reading progress for a book
router.get("/:bookId", authMiddleware, BookProgressController.get);

export default router;