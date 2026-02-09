// src/modules/verse/admin.verse.controller.ts
import { Request, Response, NextFunction } from "express";
import { VerseService } from "./verse.service";
import AppError from "../../core/AppError";

export const AdminVerseController = {
  /* =====================================================
     ADMIN: ADD VERSE
     POST /api/admin/verse
  ===================================================== */
  addVerse: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const {
        reference,
        book,
        chapter,
        verse,
        text,
        translation
      } = req.body;

      if (!reference || !book || !chapter || !verse || !text) {
        throw new AppError(
          "reference, book, chapter, verse and text are required",
          400
        );
      }

      const data = await VerseService.addVerse({
        reference,
        book,
        chapter,
        verse,
        text,
        translation: translation || "WEB"
      });

      res.status(201).json({
        success: true,
        message: "Verse added successfully",
        data
      });
    } catch (e) {
      next(e);
    }
  },

  /* =====================================================
     ADMIN: SET VERSE OF THE DAY (OVERRIDE)
     POST /api/admin/verse/set
  ===================================================== */
  setVerseOfDay: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date, verseId } = req.body;

      if (!date || !verseId) {
        throw new AppError(
          "date (YYYY-MM-DD) and verseId are required",
          400
        );
      }

      const data = await VerseService.setForDate(date, verseId);

      res.status(200).json({
        success: true,
        message: "Verse of the day set successfully",
        data
      });
    } catch (e) {
      next(e);
    }
  }
};