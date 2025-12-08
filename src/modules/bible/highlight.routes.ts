import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { HighlightController } from "./highlight.controller";

const router = Router();

// Create highlight
router.post("/", authMiddleware, HighlightController.createHighlight);

// Get all highlights for logged-in user
router.get("/", authMiddleware, HighlightController.getHighlights);

// Delete highlight
router.delete("/:id", authMiddleware, HighlightController.deleteHighlight);

export default router;
