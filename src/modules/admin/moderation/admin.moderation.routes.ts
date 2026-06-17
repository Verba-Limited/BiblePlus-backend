import { Router } from "express";
import { ModerationController } from "./admin.moderation.controller";

const router = Router();

// Overview
router.get("/queue", ModerationController.getQueueCounts);

// Prayer moderation
router.get("/prayers", ModerationController.getPendingPrayers);
router.put("/prayers/:id/approve", ModerationController.approvePrayer);
router.put("/prayers/:id/flag", ModerationController.flagPrayer);
router.delete("/prayers/:id/reject", ModerationController.rejectPrayer);

// Comment moderation
router.get("/comments", ModerationController.getPendingComments);
router.put("/comments/:id/approve", ModerationController.approveComment);
router.put("/comments/:id/flag", ModerationController.flagComment);
router.delete("/comments/:id/reject", ModerationController.rejectComment);

export default router;
