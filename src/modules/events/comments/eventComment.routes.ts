import { Router } from "express";
import authMiddleware from "../../../middleware/auth.middleware";
import { EventCommentController } from "./eventComment.controller";

const router = Router();

// Get all comments for an event
router.get("/:eventId", EventCommentController.list);

// Add a comment
router.post("/", authMiddleware, EventCommentController.add);

// Delete (admin or owner)
router.delete("/:id", authMiddleware, EventCommentController.delete);

export default router;
