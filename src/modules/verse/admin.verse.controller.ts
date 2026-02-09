import { Request, Response, NextFunction } from "express";
import { VerseService } from "./verse.service";
import AppError from "../../core/AppError";

export const AdminVerseController = {
  /* =====================================================
     SET / OVERRIDE VERSE OF THE DAY
     POST /api/admin/verse/set
  ===================================================== */
  setVerseOfDay: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const {
        date,
        reference,
        book,
        chapter,
        verse,
        text,
        translation
      } = req.body;

      if (
        !date ||
        !reference ||
        !book ||
        !chapter ||
        !verse ||
        !text
      ) {
        throw new AppError(
          "date, reference, book, chapter, verse and text are required",
          400
        );
      }

      const record = await VerseService.setForDate(date, {
        
        reference,
        book,
        chapter,
        verse,
        text,
        translation

      });

      res.status(200).json({
        success: true,
        data: record
      });
    } catch (err) {
      next(err);
    }
  }
};