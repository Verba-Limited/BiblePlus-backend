import { Router } from "express";
import { NotificationAdminController } from "./notification.admin.controller";
import { adminOnly } from "../../middleware/admin.middleware";

const router = Router();

// ADMIN: Send to single user
router.post("/send", adminOnly, NotificationAdminController.sendToUser);

// ADMIN: Broadcast
router.post("/broadcast", adminOnly, NotificationAdminController.sendBroadcast);

// ADMIN: List all notifications
router.get("/all", adminOnly, NotificationAdminController.listAll);

// ADMIN: Delete notification
router.delete("/:id", adminOnly, NotificationAdminController.delete);

// ADMIN: Resend notification
router.post("/:id/resend", adminOnly, NotificationAdminController.resend);

export default router;
