import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { NotificationController } from "./notification.controller";

const router = Router();

/* ============================================
        USER NOTIFICATION ROUTES
============================================ */

// Get logged-in user's notifications (paginated)
router.get("/", authMiddleware, NotificationController.getMyNotifications);

// Mark ONE notification as read
router.put("/:id/read", authMiddleware, NotificationController.markRead);

// Mark ALL notifications as read
router.put("/read/all", authMiddleware, NotificationController.markAllRead);

// Get unread count only
router.get("/unread/count", authMiddleware, NotificationController.getUnreadCount);


/* ============================================
        ADMIN NOTIFICATION ROUTES
============================================ */

// Admin: Send notification to ONE user
router.post(
  "/send",
  authMiddleware,
  adminOnly,
  NotificationController.adminSendToUser
);

router.post(
  "/broadcast",
  authMiddleware,
  adminOnly,
  NotificationController.adminBroadcast
);


export default router;
