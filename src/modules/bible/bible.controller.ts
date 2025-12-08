import { Request, Response, NextFunction } from "express";
import { BibleService } from "./bible.service";

export const BibleController = {
  getBooks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const version = (req.query.version as string) || "kjv";
      const data = await BibleService.getBooks(version);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  getVerses: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const version = (req.query.version as string) || "kjv";
      const book = req.query.book as string;
      const chapter = Number(req.query.chapter);

      const data = await BibleService.getVerses(book, chapter, version);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};
