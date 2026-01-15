// src/modules/books/bookProgress.service.ts

import AppError from "../../core/AppError";
import { BookProgress } from "./bookProgress.model";
import { BookChapter } from "./bookChapter.model";

export const BookProgressService = {
  // -----------------------------------------------------
  // UPDATE OR CREATE BOOK PROGRESS
  // -----------------------------------------------------
  updateProgress: async (
    userId: string,
    bookId: string,
    chapter: number
  ) => {
    if (!bookId || !chapter) {
      throw new AppError("bookId and chapter are required", 400);
    }

    // Get total chapters
    const totalChapters = await BookChapter.countDocuments({ bookId });

    if (totalChapters === 0) {
      throw new AppError("This book has no chapters yet", 400);
    }

    // Clamp chapter to valid range
    const safeChapter = Math.min(Math.max(chapter, 1), totalChapters);

    // Calculate percentage
    const percentage = Math.round(
      (safeChapter / totalChapters) * 100
    );

    const progress = await BookProgress.findOneAndUpdate(
      { userId, bookId },
      {
        currentChapter: safeChapter,
        percentage,
      },
      {
        new: true,
        upsert: true,           // ✅ CREATE if missing
        setDefaultsOnInsert: true,
      }
    );

    return progress;
  },

  // -----------------------------------------------------
  // GET USER BOOK PROGRESS
  // -----------------------------------------------------
  getProgress: async (userId: string, bookId: string) => {
    return await BookProgress.findOne({ userId, bookId });
  },
};