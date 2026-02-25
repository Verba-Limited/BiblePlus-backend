import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { ProfileController } from "./profile.controller";

const router = Router();

router.get("/me", authMiddleware, ProfileController.getProfile);

router.put("/", authMiddleware, ProfileController.updateProfile);

router.put("/change-password", authMiddleware, ProfileController.changePassword);

router.put(
  "/notification-settings",
  authMiddleware,
  ProfileController.updateNotificationSettings
);

router.delete("/", authMiddleware, ProfileController.deleteAccount);

export default router;