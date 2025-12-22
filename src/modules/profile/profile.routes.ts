import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { ProfileController } from "./profile.controller";
import multer from "multer";

const upload = multer({ dest: "uploads/avatars" });
const router = Router();

router.get("/", authMiddleware, ProfileController.getProfile);
router.put("/", authMiddleware, ProfileController.updateProfile);
router.post(
  "/avatar",
  authMiddleware,
  upload.single("avatar"),
  ProfileController.uploadAvatar
);

export default router;
