// src/modules/verse/verse.controller.ts
import { Request, Response, NextFunction } from "express";
import { VerseService } from "./verse.service";

export const VerseController = {
  today: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await VerseService.getToday();
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  history: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await VerseService.history();
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }
};