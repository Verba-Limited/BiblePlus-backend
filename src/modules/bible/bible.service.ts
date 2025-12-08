import AppError from "../../core/AppError";
import { Highlight } from "./highlight.model";
import { BibleLoader } from "./bible.loader";

export const BibleService = {
  getBooks: async (version: string) => {
    const bible = BibleLoader.getVersion(version);
    if (!bible) throw new AppError("Invalid version", 400);

    return bible.books.map((b: any) => ({
      name: b.name,
      chapters: b.chapters.length
    }));
  },

  getVerses: async (bookName: string, chapter: number, version: string) => {
    const bible = BibleLoader.getVersion(version);
    if (!bible) throw new AppError("Invalid version", 400);

    const book = bible.books.find(
      (b: any) => b.name.toLowerCase() === bookName.toLowerCase()
    );

    if (!book) throw new AppError("Book not found", 404);

    const chapterObj = book.chapters.find((c: any) => c.chapter === chapter);
    if (!chapterObj) throw new AppError("Chapter not found", 404);

    return {
      book: book.name,
      chapter: chapter,
      version,
      verses: chapterObj.verses
    };
  },

  highlightVerse: async (
    userId: string,
    book: string,
    chapter: number,
    verse: number,
    version: string
  ) => {
    const data = await BibleService.getVerses(book, chapter, version);

    const v = data.verses.find((v: any) => v.verse === verse);
    if (!v) throw new AppError("Verse not found", 404);

    return await Highlight.create({
      userId,
      book,
      chapter,
      verse,
      text: v.text,
      version
    });
  },

  getHighlights: async (userId: string) => {
    return await Highlight.find({ userId }).sort({ createdAt: -1 });
  }
};
