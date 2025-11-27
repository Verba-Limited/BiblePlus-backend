import { BibleBook } from "./bibleBook.model";
import { BibleVerse } from "./bibleVerse.model";
import { Highlight } from "./highlight.model";
import AppError from "../../core/AppError";

export const BibleService = {
  // Get all books
  getBooks: async () => {
    return await BibleBook.find({}).sort({ name: 1 });
  },

  // Get verses from selected version
  getVerses: async (book: string, chapter: number, version: string) => {
    const verses = await BibleVerse.find({ book, chapter, version }).sort({
      verse: 1,
    });

    if (!verses.length)
      throw new AppError("No verses found for this chapter or version", 404);

    return verses;
  },

  // Highlight a verse
  highlightVerse: async (
    userId: string,
    book: string,
    chapter: number,
    verse: number,
    version: string
  ) => {
    const verseData = await BibleVerse.findOne({
      book,
      chapter,
      verse,
      version,
    });

    if (!verseData) throw new AppError("Verse not found", 404);

    return await Highlight.create({
      userId,
      book,
      chapter,
      verse,
      version,
      text: verseData.text,
    });
  },

  // Get user highlights
  getHighlights: async (userId: string) => {
    return await Highlight.find({ userId }).sort({ createdAt: -1 });
  },
};
