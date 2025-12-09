import { Request, Response, NextFunction } from "express";
import { PrayerService } from "./prayer.service";

export const PrayerController = {
  /* ============================================
        USER: CREATE PRAYER REQUEST
  ============================================ */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const data = await PrayerService.create({
        ...req.body,
        userId,
        image: req.file?.filename || ""
      });

      res.json({
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
  ============================================ */
  getPublic: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { page = 1, limit = 20 } = req.query;

      // @ts-ignore (optional user context)
      const userId = req.userId || null;

      const data = await PrayerService.getPublic(
        Number(page),
        Number(limit),
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
      // @ts-ignore
      const userId = req.userId;

      const data = await PrayerService.getUserRequests(userId);

      res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* ============================================
        ADMIN: APPROVE PRAYER REQUEST
  ============================================ */
  approve: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await PrayerService.approve(req.params.id);

      res.json({
        success: true,
        message: "Prayer request approved",
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* ============================================
        ADMIN: MARK REQUEST AS ANSWERED
  ============================================ */
  markAnswered: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await PrayerService.markAnswered(req.params.id);

      res.json({
        success: true,
        message: "Prayer request marked as answered",
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* ============================================
        OPTIONAL ADMIN: DELETE REQUEST
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
