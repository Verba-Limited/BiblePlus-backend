import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { EventReminderController } from "./eventReminder.controller";

const router = Router({ mergeParams: true }); // ✅ access :eventId from parent

// POST   /api/events/:eventId/remind     → set reminder
router.post("/remind", authMiddleware, EventReminderController.add);

// DELETE /api/events/:eventId/remind     → remove reminder
router.delete("/remind", authMiddleware, EventReminderController.remove);

// GET    /api/events/mine                → get all reminders for user
router.get("/mine", authMiddleware, EventReminderController.all);

export default router;