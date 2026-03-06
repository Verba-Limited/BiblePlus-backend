import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { VerseEngagementController } from "./verseEngagement.controller";

const router = Router();

/* ============================================
   USER ENGAGEMENT HISTORY
   GET /api/verse/history/me
============================================ */
router.get(
  "/history/me",
  authMiddleware,
  VerseEngagementController.history
);

/* ============================================
   LIKE / UNLIKE VERSE
   POST /api/verse/:id/like
============================================ */
router.post(
  "/:id/like",
  authMiddleware,
  VerseEngagementController.like
);

/* ============================================
   COMMENT / REPLY
   POST /api/verse/:id/comment
============================================ */
router.post(
  "/:id/comment",
  authMiddleware,
  VerseEngagementController.comment
);

/* ============================================
   GET VERSE COMMENTS (THREADS)
   GET /api/verse/:id/comments
============================================ */
router.get(
  "/:id/comments",
  VerseEngagementController.comments
);

/* ============================================
   SHARE VERSE
   POST /api/verse/:id/share
============================================ */
router.post(
  "/:id/share",
  authMiddleware,
  VerseEngagementController.share
);

/* ============================================
   GET VERSE STATS
   GET /api/verse/:id/stats
============================================ */
router.get(
  "/:id/stats",
  VerseEngagementController.stats
);

export default router;