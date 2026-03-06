import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { VerseReactionController } from "./verseReaction.controller";

const router = Router();

router.post(
  "/:id/react",
  authMiddleware,
  VerseReactionController.react
);

router.get(
  "/:id/reactions",
  VerseReactionController.stats
);

export default router;