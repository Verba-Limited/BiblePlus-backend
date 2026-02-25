import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types/auth.types";
import { ProfileService } from "./profile.service";
import AppError from "../../core/AppError";

export const ProfileController = {

  /* =========================
     GET PROFILE
  ========================= */
  getProfile: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
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

  /* =========================
     UPDATE PROFILE
  ========================= */
  updateProfile: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
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

  /* =========================
     UPLOAD / UPDATE AVATAR
  ========================= */
  updateAvatar: async (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => {
    try {
      if (!req.file) {
        throw new AppError("No avatar uploaded", 400);
      }

      const avatarPath = `/uploads/avatars/${req.file.filename}`;

      const user = await ProfileService.updateAvatar(
        req.userId,
        avatarPath
      );

      res.json({
        success: true,
        message: "Avatar updated successfully",
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

};