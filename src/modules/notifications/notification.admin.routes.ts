import { Router } from "express";
import { NotificationAdminController } from "./notification.admin.controller";
import { adminOnly } from "../../middleware/admin.middleware";
import authMiddleware from "../../middleware/auth.middleware";

const router = Router();

// ADMIN: Send to single user
router.post("/send", authMiddleware, adminOnly, NotificationAdminController.sendToUser);

// ADMIN: Broadcast
router.post("/broadcast", authMiddleware, adminOnly, NotificationAdminController.sendBroadcast);

// ADMIN: List all notifications
router.get("/all", authMiddleware, adminOnly, NotificationAdminController.listAll);

// ADMIN: Delete notification
router.delete("/:id", authMiddleware, adminOnly, NotificationAdminController.delete);

// ADMIN: Resend notification
router.post("/:id/resend", authMiddleware, adminOnly, NotificationAdminController.resend);

export default router;
