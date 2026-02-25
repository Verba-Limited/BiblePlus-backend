import { Request, Response, NextFunction } from "express";
import { ProfileService } from "./profile.service";
import AppError from "../../core/AppError";

export const ProfileController = {

  getProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {

      if (!req.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const data = await ProfileService.getProfile(req.userId);

      res.json({ success: true, data });

    } catch (err) {
      next(err);
    }
  },

  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {

      if (!req.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const data = await ProfileService.updateProfile(
        req.userId,
        req.body
      );

      res.json({
        success: true,
        message: "Profile updated successfully",
        data
      });

    } catch (err) {
      next(err);
    }
  },

  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {

      if (!req.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const { currentPassword, newPassword } = req.body;

      const data = await ProfileService.changePassword(
        req.userId,
        currentPassword,
        newPassword
      );

      res.json({ success: true, data });

    } catch (err) {
      next(err);
    }
  },

  updateNotificationSettings: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {

      if (!req.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const data =
        await ProfileService.updateNotificationSettings(
          req.userId,
          req.body
        );

      res.json({ success: true, data });

    } catch (err) {
      next(err);
    }
  },

  deleteAccount: async (req: Request, res: Response, next: NextFunction) => {
    try {

      if (!req.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const data = await ProfileService.deleteAccount(req.userId);

      res.json({ success: true, data });

    } catch (err) {
      next(err);
    }
  }
};