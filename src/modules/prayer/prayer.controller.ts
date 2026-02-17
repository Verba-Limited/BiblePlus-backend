import { Request, Response, NextFunction } from "express";
import { PrayerService } from "./prayer.service";
import AppError from "../../core/AppError";

export const PrayerController = {
  /* ============================================
        USER: CREATE PRAYER REQUEST
  ============================================ */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401);
      }

      const data = await PrayerService.create({
        ...req.body,
        userId: req.userId,
        image: req.file?.filename || ""
      });

      res.status(201).json({
        success: true,
        message: "Prayer request submitted successfully",
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* ============================================
        PUBLIC: PRAYER WALL
        No approval needed
  ============================================ */
  getPublic: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const userId = req.userId || undefined;

      const data = await PrayerService.getPublic(
        page,
        limit,
        userId
      );

      res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* ============================================
        USER: GET THEIR PRAYER REQUESTS
  ============================================ */
  getUserRequests: async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401);
      }

      const data = await PrayerService.getUserRequests(req.userId);

      res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* ============================================
        ADMIN: DELETE PRAYER REQUEST
        (ONLY ADMIN POWER)
  ============================================ */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await PrayerService.delete(req.params.id);

      res.json({
        success: true,
        message: "Prayer request deleted",
        data
      });
    } catch (err) {
      next(err);
    }
  }
};