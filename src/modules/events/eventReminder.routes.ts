import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { EventReminderController } from "./eventReminder.controller";

const router = Router();

router.post("/add", authMiddleware, EventReminderController.add);
router.post("/remove", authMiddleware, EventReminderController.remove);
router.get("/", authMiddleware, EventReminderController.all);

export default router;
