import { Request, Response, NextFunction } from "express";
import { VerseService } from "./verse.service";
import AppError from "../../core/AppError";

export const AdminVerseController = {
  /* =====================================================
     LOAD SAMPLE VERSE
     GET /api/admin/verse/sample

     Backs the editor's "Load sample" button, which had no
     endpoint to call at all.
  ===================================================== */
  loadSample: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await VerseService.getSample();
      res.status(200).json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     PREVIEW — today, or a given ?date=YYYY-MM-DD
     GET /api/admin/verse/preview
  ===================================================== */
  preview: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const date = req.query.date ? String(req.query.date) : undefined;

      const data = date
        ? await VerseService.getForDate(date)
        : await VerseService.getToday();

      res.status(200).json({
        success: true,
        // A date with nothing set yet is a valid answer, not an error
        isSet: Boolean(data),
        data: data ?? null
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     HISTORY
     GET /api/admin/verse/history
  ===================================================== */
  history: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 200);
      const data = await VerseService.history(limit);

      res.status(200).json({ success: true, count: data.length, data });
    } catch (err) {
      next(err);
    }
  },

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

      // Default to today so the editor can save a loaded sample
      // without having to pick a date first.
      const targetDate = date || new Date().toISOString().split("T")[0];

      const missing = Object.entries({ reference, book, chapter, verse, text })
        .filter(([, v]) => v === undefined || v === null || v === "")
        .map(([k]) => k);

      if (missing.length) {
        throw new AppError(
          `Missing required field(s): ${missing.join(", ")}`,
          400
        );
      }

      const record = await VerseService.setForDate(targetDate, {
        reference,
        book,
        chapter: Number(chapter),
        verse: Number(verse),
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