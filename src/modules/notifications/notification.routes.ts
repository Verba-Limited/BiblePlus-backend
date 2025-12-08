import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { NotificationController } from "./notification.controller";

const router = Router();

// Get all notifications
router.get("/", authMiddleware, NotificationController.getMyNotifications);

// Mark specific notification as read
router.put("/:id/read", authMiddleware, NotificationController.markRead);

// Mark all as read
router.put("/read/all", authMiddleware, NotificationController.markAllRead);

export default router;
