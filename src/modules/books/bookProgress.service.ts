import { BookProgress } from "./bookProgress.model";
import { BookChapter } from "./bookChapter.model";

export const BookProgressService = {
  updateProgress: async (userId: string, bookId: string, chapter: number) => {
    const totalChapters = await BookChapter.countDocuments({ bookId });

    const percentage = Math.round((chapter / totalChapters) * 100);

    const progress = await BookProgress.findOneAndUpdate(
      { userId, bookId },
      { currentChapter: chapter, percentage },
      { new: true, upsert: true }
    );

    return progress;
  },

  getProgress: async (userId: string, bookId: string) => {
    return await BookProgress.findOne({ userId, bookId });
  }
};
