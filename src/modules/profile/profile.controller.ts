import { Request, Response, NextFunction } from "express";
import { ProfileService } from "./profile.service";
import AppError from "../../core/AppError";

export const ProfileController = {
  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const profile = await ProfileService.getProfile(userId);
      res.json({ success: true, data: profile });
    } catch (err) {
      next(err);
    }
  },

  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const updated = await ProfileService.updateProfile(userId, req.body);
      res.json({
        success: true,
        message: "Profile updated",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },

  uploadAvatar: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No avatar uploaded",
        });
      }

      const avatarPath = `/uploads/avatars/${req.file.filename}`;
      const user = await ProfileService.updateAvatar(userId, avatarPath);

      res.json({
        success: true,
        message: "Avatar updated",
        data: user,
      });
    } catch (err) {
      next(err);
    },

updateAvatar: async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {

    if (!req.userId) {
      throw new AppError("Unauthorized", 401);
    }

    if (!req.file) {
      throw new AppError("No image uploaded", 400);
    }

    const avatarPath = `/uploads/avatars/${req.file.filename}`;

    const data = await ProfileService.updateAvatar(
      req.userId,
      avatarPath
    );

    res.json({
      success: true,
      message: "Avatar updated successfully",
      data
    });

  } catch (err) {
    next(err);
  }
}

  },
};
