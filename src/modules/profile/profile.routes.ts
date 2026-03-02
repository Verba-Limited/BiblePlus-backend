import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { uploadAvatar } from "../../middleware/upload.middleware";
import { ProfileController } from "./profile.controller";

const router = Router();

/* =========================
   GET MY PROFILE
   GET /api/profile/me
========================= */
router.get(
  "/me",
  authMiddleware,
  ProfileController.getProfile
);

/* =========================
   UPDATE PROFILE
   PUT /api/profile
========================= */
router.put(
  "/",
  authMiddleware,
  ProfileController.updateProfile
);

/* =========================
   CHANGE PASSWORD
   PUT /api/profile/change-password
========================= */
router.put(
  "/change-password",
  authMiddleware,
  ProfileController.changePassword
);

/* =========================
   UPDATE NOTIFICATION SETTINGS
   PUT /api/profile/notification-settings
========================= */
router.put(
  "/notification-settings",
  authMiddleware,
  ProfileController.updateNotificationSettings
);

/* =========================
   UPDATE AVATAR
   PUT /api/profile/avatar
========================= */
router.put(
  "/avatar",
  authMiddleware,
  uploadAvatar,
  ProfileController.updateAvatar
);

/* =========================
   DELETE ACCOUNT
   DELETE /api/profile
========================= */
router.delete(
  "/",
  authMiddleware,
  ProfileController.deleteAccount
);

export default router;