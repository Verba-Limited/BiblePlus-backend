import { Router } from "express";
import { NotificationAdminController } from "./notification.admin.controller";

const router = Router();

// ADMIN: Send to single user
router.post("/send", NotificationAdminController.sendToUser);

// ADMIN: Broadcast
router.post("/broadcast", NotificationAdminController.sendBroadcast);

// ADMIN: List all notifications
router.get("/all", NotificationAdminController.listAll);

// ADMIN: Delete notification
router.delete("/:id", NotificationAdminController.delete);

// ADMIN: Resend notification
router.post("/:id/resend", NotificationAdminController.resend);

export default router;
