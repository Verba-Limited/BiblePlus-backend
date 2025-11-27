import { Request, Response, NextFunction } from "express";
import { BibleService } from "./bible.service";

export const BibleController = {
  // GET ALL BOOKS
  getBooks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const books = await BibleService.getBooks();
      res.json({ success: true, data: books });
    } catch (err) {
      next(err);
    }
  },

  // GET VERSES WITH VERSION
  getVerses: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { book, chapter, version } = req.query;

      if (!book || !chapter || !version) {
        return res.status(400).json({
          success: false,
          message: "book, chapter, and version are required",
        });
      }

      const data = await BibleService.getVerses(
        book as string,
        Number(chapter),
        version as string
      );

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // HIGHLIGHT A VERSE
  highlight: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { book, chapter, verse, version } = req.body;

      if (!book || !chapter || !verse || !version) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields",
        });
      }

      const result = await BibleService.highlightVerse(
        userId,
        book,
        chapter,
        verse,
        version
      );

      res.json({
        success: true,
        message: "Verse highlighted",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET USER HIGHLIGHTS
  getHighlights: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const highlights = await BibleService.getHighlights(userId);

      res.json({
        success: true,
        data: highlights,
      });
    } catch (err) {
      next(err);
    }
  },
};
