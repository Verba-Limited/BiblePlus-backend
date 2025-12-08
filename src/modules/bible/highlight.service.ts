import { Highlight } from "./highlight.model";
import AppError from "../../core/AppError";
import { BibleService } from "./bible.service";

export const HighlightService = {
  // Create highlight
  createHighlight: async (
    userId: string,
    book: string,
    chapter: number,
    verse: number,
    version: string
  ) => {
    // Get verse text from Bible JSON
    const verseData = await BibleService.getVerses(book, chapter, version);
    const verseObj = verseData.verses.find((v: any) => v.verse === verse);

    if (!verseObj) throw new AppError("Verse not found", 404);

    const highlight = await Highlight.create({
      userId,
      book,
      chapter,
      verse,
      version,
      text: verseObj.text,
    });

    return highlight;
  },

  // Get all highlights for a user
  getHighlights: async (userId: string) => {
    return await Highlight.find({ userId }).sort({ createdAt: -1 });
  },

  // Delete a highlight
  deleteHighlight: async (userId: string, highlightId: string) => {
    const deleted = await Highlight.findOneAndDelete({
      _id: highlightId,
      userId,
    });

    if (!deleted) {
      throw new AppError("Highlight not found or unauthorized", 404);
    }

    return deleted;
  },
};
