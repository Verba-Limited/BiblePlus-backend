import { Request, Response, NextFunction } from "express";
import { BookProgressService } from "./bookProgress.service";

export const BookProgressController = {
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { bookId, chapter } = req.body;

      const progress = await BookProgressService.updateProgress(
        userId,
        bookId,
        Number(chapter)
      );

      res.json({ success: true, data: progress });
    } catch (err) {
      next(err);
    }
  },

  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { bookId } = req.params;

      const progress = await BookProgressService.getProgress(userId, bookId);

      res.json({ success: true, data: progress });
    } catch (err) {
      next(err);
    }
  }
};
