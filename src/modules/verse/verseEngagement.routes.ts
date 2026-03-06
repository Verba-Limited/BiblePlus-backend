import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { VerseEngagementController } from "./verseEngagement.controller";

const router = Router();

router.post("/:id/like", authMiddleware, VerseEngagementController.like);

router.post("/:id/comment", authMiddleware, VerseEngagementController.comment);

router.get("/:id/comments", VerseEngagementController.comments);

router.post("/:id/share", authMiddleware, VerseEngagementController.share);

router.get("/:id/stats", VerseEngagementController.stats);

router.get("/history/me", authMiddleware, VerseEngagementController.history);

export default router;