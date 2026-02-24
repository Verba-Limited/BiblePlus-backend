import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { NotificationController } from "./notification.controller";

const router = Router();

router.get(
  "/me",
  authMiddleware,
  NotificationController.getMyNotifications
);

router.put(
  "/read/:id",
  authMiddleware,
  NotificationController.markAsRead
);

export default router;