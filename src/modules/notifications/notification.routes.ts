import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { NotificationController } from "./notification.controller";

const router = Router();

/* ============================================
   USER NOTIFICATIONS
============================================ */

// Get my notifications
router.get(
  "/me",
  authMiddleware,
  NotificationController.getMyNotifications
);

// Get unread count
router.get(
  "/unread-count",
  authMiddleware,
  NotificationController.getUnreadCount
);

// Mark single notification as read
router.put(
  "/read/:id",
  authMiddleware,
  NotificationController.markAsRead
);

// Mark all as read
router.put(
  "/read-all",
  authMiddleware,
  NotificationController.markAllAsRead
);

/* ============================================
   ADMIN BROADCAST
============================================ */

router.post(
  "/admin/broadcast",
  authMiddleware,
  adminOnly,
  NotificationController.broadcast
);

export default router;