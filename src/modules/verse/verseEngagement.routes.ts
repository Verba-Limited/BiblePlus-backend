import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { VerseEngagementController } from "./verseEngagement.controller";

const router = Router();

/* USER HISTORY */
router.get(
  "/history/me",
  authMiddleware,
  VerseEngagementController.history
);

/* LIKE */
router.post(
  "/:id/like",
  authMiddleware,
  VerseEngagementController.like
);

/* COMMENT */
router.post(
  "/:id/comment",
  authMiddleware,
  VerseEngagementController.comment
);

/* GET COMMENTS */
router.get(
  "/:id/comments",
  VerseEngagementController.comments
);

/* SHARE */
router.post(
  "/:id/share",
  authMiddleware,
  VerseEngagementController.share
);

/* STATS */
router.get(
  "/:id/stats",
  VerseEngagementController.stats
);

export default router;