// src/modules/verse/verse.controller.ts
import { Request, Response, NextFunction } from "express";
import { VerseService } from "./verse.service";
import AppError from "../../core/AppError";

export const VerseController = {
  /* =====================================================
     GET VERSE OF TODAY
     GET /api/verse/today
  ===================================================== */
  today: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await VerseService.getToday();

      res.status(200).json({
        success: true,
        data
      });
    } catch (e) {
      next(e);
    }
  },

  /* =====================================================
     VERSE HISTORY
     GET /api/verse/history
  ===================================================== */
  history: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await VerseService.history();

      res.status(200).json({
        success: true,
        data
      });
    } catch (e) {
      next(e);
    }
  },

  /* =====================================================
     ADMIN: SET VERSE FOR DATE
     POST /api/admin/verse/set
  ===================================================== */
  setForDate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date, ...payload } = req.body;

      if (!date) {
        throw new AppError("Date is required (YYYY-MM-DD)", 400);
      }

      const data = await VerseService.setForDate(date, payload);

      res.status(200).json({
        success: true,
        message: "Verse set successfully",
        data
      });
    } catch (e) {
      next(e);
    }
  }
};