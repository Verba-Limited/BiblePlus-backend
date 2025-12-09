import { Request, Response, NextFunction } from "express";
import AppError from "../../core/AppError";
import { BibleService } from "./bible.service";

const DEFAULT_VERSION = "kjv";
const SEARCH_RESULT_LIMIT = 50; // keep searches bounded

export const BibleController = {
  // -----------------------------------------------------
  // GET BOOKS
  // GET /bible/books?version=kjv
  // -----------------------------------------------------
  getBooks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const version = (req.query.version as string) || DEFAULT_VERSION;
      const data = await BibleService.getBooks(version);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // GET CHAPTERS
  // GET /bible/chapters?book=Genesis&version=kjv
  // -----------------------------------------------------
  getChapters: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const version = (req.query.version as string) || DEFAULT_VERSION;
      const bookName = req.query.book as string;

      if (!bookName) {
        return res.status(400).json({
          success: false,
          message: "Book name is required (query param: book)"
        });
      }

      const books = await BibleService.getBooks(version);
      const book = books.find(
        (b: any) => String(b.name).toLowerCase() === bookName.toLowerCase()
      );

      if (!book) {
        return res.status(404).json({
          success: false,
          message: "Book not found"
        });
      }

      // book.chapters is expected to be a count (from getBooks)
      const chaptersCount = Number(book.chapters) || 0;
      const chapters = Array.from({ length: chaptersCount }, (_, i) => i + 1);

      res.json({ success: true, data: { book: book.name, chapters } });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // GET VERSES
  // GET /bible/verses?book=Genesis&chapter=1&version=kjv
  // -----------------------------------------------------
  getVerses: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const version = (req.query.version as string) || DEFAULT_VERSION;
      const book = req.query.book as string;
      const chapterRaw = req.query.chapter;

      if (!book || !chapterRaw) {
        return res.status(400).json({
          success: false,
          message: "book and chapter query parameters are required"
        });
      }

      const chapter = Number(chapterRaw);
      if (Number.isNaN(chapter) || chapter <= 0) {
        return res.status(400).json({
          success: false,
          message: "chapter must be a positive integer"
        });
      }

      const data = await BibleService.getVerses(book, chapter, version);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // SEARCH (case-insensitive)
  // GET /bible/search?q=light&version=kjv
  // -----------------------------------------------------
  search: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const version = (req.query.version as string) || DEFAULT_VERSION;
      const q = (req.query.q as string || "").trim();

      if (!q) {
        return res.status(400).json({
          success: false,
          message: "Query param 'q' is required for search"
        });
      }

      // get all books (name + chapter counts)
      const booksSummary = await BibleService.getBooks(version);

      const results: Array<any> = [];
      // iterate books and chapters (stop when we hit the result cap)
      for (const b of booksSummary) {
        if (results.length >= SEARCH_RESULT_LIMIT) break;

        const bookName = b.name;
        const chaptersCount = Number(b.chapters) || 0;

        for (let ch = 1; ch <= chaptersCount; ch++) {
          if (results.length >= SEARCH_RESULT_LIMIT) break;

          try {
            const { verses } = await BibleService.getVerses(
              bookName,
              ch,
              version
            );

            for (const v of verses) {
              if (results.length >= SEARCH_RESULT_LIMIT) break;

              const text = String(v.text || "");
              if (text.toLowerCase().includes(q.toLowerCase())) {
                results.push({
                  book: bookName,
                  chapter: ch,
                  verse: v.verse,
                  text
                });
              }
            }
          } catch (e) {
            // ignore missing chapters / books during search
            continue;
          }
        }
      }

      res.json({
        success: true,
        data: results,
        meta: { query: q, version, limit: SEARCH_RESULT_LIMIT }
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // HIGHLIGHT A VERSE (requires auth)
  // POST /bible/highlight
  // body: { book, chapter, verse, version }
  // -----------------------------------------------------
  highlightVerse: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore - added by auth middleware
      const userId = req.userId as string;
      const { book, chapter, verse, version } = req.body;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      if (!book || !chapter || !verse) {
        return res.status(400).json({
          success: false,
          message: "book, chapter and verse are required in the request body"
        });
      }

      const ch = Number(chapter);
      const vnum = Number(verse);
      if (Number.isNaN(ch) || Number.isNaN(vnum)) {
        return res.status(400).json({
          success: false,
          message: "chapter and verse must be numbers"
        });
      }

      const ver = (version as string) || DEFAULT_VERSION;

      const created = await BibleService.highlightVerse(
        userId,
        book,
        ch,
        vnum,
        ver
      );

      res.json({ success: true, data: created });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // GET USER HIGHLIGHTS (requires auth)
  // GET /bible/highlights
  // -----------------------------------------------------
  getHighlights: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId as string;

      if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
      }

      const data = await BibleService.getHighlights(userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};
