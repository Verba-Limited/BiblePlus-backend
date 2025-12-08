import { Request, Response, NextFunction } from "express";
import { BookService } from "./book.service";

export const BookController = {
  // ------------------------------------------------------------------
  // GET ALL BOOKS (Supports: audience, category)
  // Example: /api/books?audience=kids&category=devotional
  // ------------------------------------------------------------------
  getBooks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, audience } = req.query;

      const books = await BookService.getBooks({
        category: category as string,
        audience: audience as string
      });

      res.json({ success: true, data: books });
    } catch (err) {
      next(err);
    }
  },

  // ------------------------------------------------------------------
  // GET SINGLE BOOK
  // ------------------------------------------------------------------
  getBook: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const book = await BookService.getBook(req.params.id);
      res.json({ success: true, data: book });
    } catch (err) {
      next(err);
    }
  },

  // ------------------------------------------------------------------
  // GET ALL CHAPTERS OF A BOOK
  // ------------------------------------------------------------------
  getChapters: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chapters = await BookService.getChapters(req.params.id);
      res.json({ success: true, data: chapters });
    } catch (err) {
      next(err);
    }
  },

  // ------------------------------------------------------------------
  // GET SINGLE CHAPTER OF A BOOK
  // ------------------------------------------------------------------
  getChapter: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chapterNumber = Number(req.params.chapter);
      const chapter = await BookService.getChapter(
        req.params.id,
        chapterNumber
      );

      res.json({ success: true, data: chapter });
    } catch (err) {
      next(err);
    }
  },

  // ------------------------------------------------------------------
  // SEARCH BOOKS
  // ------------------------------------------------------------------
  search: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, audience, category } = req.query;

      const books = await BookService.searchBooks({
        query: q as string,
        audience: audience as string,
        category: category as string
      });

      res.json({ success: true, data: books });
    } catch (err) {
      next(err);
    }
  }
};
