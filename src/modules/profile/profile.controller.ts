import { Request, Response, NextFunction } from "express";
import { ProfileService } from "./profile.service";
import AppError from "../../core/AppError";

export const ProfileController = {

  /* ================= GET PROFILE ================= */
  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const profile = await ProfileService.getProfile(req.userId);

      res.json({
        success: true,
        data: profile
      });
    } catch (err) {
      next(err);
    }
  },

  /* ================= UPDATE PROFILE ================= */
  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const updated = await ProfileService.updateProfile(
        req.userId,
        req.body
      );

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  /* ================= CHANGE PASSWORD ================= */
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new AppError("Missing password fields", 400);
      }

      const result = await ProfileService.changePassword(
        req.userId,
        currentPassword,
        newPassword
      );

      res.json({
        success: true,
        message: "Password changed successfully",
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  /* ================= UPDATE NOTIFICATION SETTINGS ================= */
  updateNotificationSettings: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const updated = await ProfileService.updateNotificationSettings(
        req.userId,
        req.body
      );

      res.json({
        success: true,
        message: "Notification settings updated",
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  /* ================= UPDATE AVATAR ================= */
  updateAvatar: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.file) {
        throw new AppError("No avatar uploaded", 400);
      }

      // ✅ Prefer secure_url from Cloudinary, fall back to path
      const avatarUrl = (req.file as any).secure_url ?? req.file.path;

      if (!avatarUrl || !avatarUrl.startsWith("https://res.cloudinary.com")) {
        // This means Cloudinary upload failed silently — file went to local disk
        throw new AppError("Avatar upload to Cloudinary failed", 500);
      }

      console.log("Cloudinary Upload Success:", avatarUrl);

      const user = await ProfileService.updateAvatar(req.userId, avatarUrl);

      res.json({
        success: true,
        message: "Avatar updated successfully",
        data: user
      });
    } catch (err) {
      next(err);
    }
  },

  /* ================= DELETE ACCOUNT ================= */
  deleteAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await ProfileService.deleteAccount(req.userId);

      res.json({
        success: true,
        message: "Account deleted successfully"
      });
    } catch (err) {
      next(err);
    }
  }

};