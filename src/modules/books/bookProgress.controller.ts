// src/modules/books/bookProgress.controller.ts

import { Request, Response, NextFunction } from "express";
import AppError from "../../core/AppError";
import { BookProgressService } from "./bookProgress.service";

export const BookProgressController = {
  // -----------------------------------------------------
  // UPDATE BOOK PROGRESS
  // POST /api/books/progress/update
  // -----------------------------------------------------
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Injected by auth middleware
      // @ts-ignore
      const userId: string = req.userId;

      const { bookId, chapter } = req.body;

      if (!bookId || chapter === undefined) {
        throw new AppError("bookId and chapter are required", 400);
      }

      const progress = await BookProgressService.updateProgress(
        userId,
        bookId,
        Number(chapter)
      );

      res.status(200).json({
        success: true,
        message: "Reading progress updated",
        data: progress,
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // GET USER BOOK PROGRESS
  // GET /api/books/progress/:bookId
  // -----------------------------------------------------
  get: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId: string = req.userId;
      const { bookId } = req.params;

      if (!bookId) {
        throw new AppError("bookId is required", 400);
      }

      const progress = await BookProgressService.getProgress(userId, bookId);

      res.status(200).json({
        success: true,
        data: progress || {
          bookId,
          currentChapter: 0,
          percentage: 0,
        },
      });
    } catch (err) {
      next(err);
    }
  },
};