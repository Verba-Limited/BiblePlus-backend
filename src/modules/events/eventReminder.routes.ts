import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { EventReminderController } from "./eventReminder.controller";

const router = Router({ mergeParams: true }); // ✅ needed to access :eventId from parent

router.post("/remind", authMiddleware, EventReminderController.add);
router.delete("/remind", authMiddleware, EventReminderController.remove);
router.get("/mine", authMiddleware, EventReminderController.all);

export default router;