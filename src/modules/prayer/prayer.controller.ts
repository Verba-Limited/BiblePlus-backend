import { Request, Response, NextFunction } from "express";
import { PrayerService } from "./prayer.service";
import AppError from "../../core/AppError";

export const PrayerController = {

  /* ============================================
     CREATE PRAYER
  ============================================ */
  create: async (req, res, next) => {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401);
      }

      const data = await PrayerService.create(
        req.userId,
        {
          ...req.body,
          image: req.file?.filename || ""
        }
      );

      res.status(201).json({
        success: true,
        message: "Prayer submitted",
        data
      });
    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     PUBLIC WALL
  ============================================ */
  getPublic: async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;

      const data = await PrayerService.getPublic(
        page,
        limit,
        req.userId
      );

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     USER PRAYERS
  ============================================ */
  getUserRequests: async (req, res, next) => {
    try {
      if (!req.userId) {
        throw new AppError("Authentication required", 401);
      }

      const data = await PrayerService.getUserPrayers(
        req.userId
      );

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /* ============================================
     ADMIN DELETE
  ============================================ */
  delete: async (req, res, next) => {
    try {
      const data = await PrayerService.delete(
        req.params.id
      );

      res.json({
        success: true,
        message: "Prayer deleted",
        data
      });
    } catch (err) {
      next(err);
    }
  }
};