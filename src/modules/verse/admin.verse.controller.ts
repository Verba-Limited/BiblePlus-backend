// src/modules/verse/admin.verse.controller.ts
import { Request, Response, NextFunction } from "express";
import { VerseService } from "./verse.service";

export const AdminVerseController = {
  addVerse: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const verse = await VerseService.addVerse(req.body);
      res.status(201).json({ success: true, data: verse });
    } catch (e) {
      next(e);
    }
  },

  setVerseOfDay: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { date, verseId } = req.body;
      const record = await VerseService.setForDate(date, verseId);
      res.json({ success: true, data: record });
    } catch (e) {
      next(e);
    }
  }
};