import { Request, Response, NextFunction } from "express";
import { BookService } from "./book.service";

export const BookController = {

  /* ======================================================
     GET ALL BOOKS
     /api/books?category=&audience=
  ====================================================== */
  getBooks: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { category, audience } = req.query;

      const books = await BookService.getBooks({
        category: category as string,
        audience: audience as string,
      });

      res.json({
        success: true,
        count: books.length,
        data: books,
      });
    } catch (err) {
      next(err);
    }
  },

  /* ======================================================
     GET SINGLE BOOK
     /api/books/:id
  ====================================================== */
  getBook: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const book = await BookService.getBook(req.params.id);

      res.json({
        success: true,
        data: book,
      });
    } catch (err) {
      next(err);
    }
  },

  /* ======================================================
     GET ALL CHAPTERS OF A BOOK
     /api/books/:id/chapters
  ====================================================== */
  getChapters: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { isFetching, chapters } = await BookService.getChapters(
        req.params.id
      );

      res.json({
        success: true,
        // ✅ Tell frontend if this is a first-time fetch so it can show a loading state
        isFetching,
        message: isFetching
          ? "Chapters are being prepared, please wait a moment..."
          : "Chapters loaded",
        count: chapters.length,
        data: chapters,
      });
    } catch (err) {
      next(err);
    }
  },

  /* ======================================================
     GET SINGLE CHAPTER
     /api/books/:id/chapter/:chapter
  ====================================================== */
  getChapter: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const chapterNumber = Number(req.params.chapter);

      const chapter = await BookService.getChapter(
        req.params.id,
        chapterNumber
      );

      res.json({
        success: true,
        data: chapter,
      });
    } catch (err) {
      next(err);
    }
  },

  /* ======================================================
     SEARCH BOOKS
     /api/books/search?q=&category=&audience=
  ====================================================== */
  search: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { q, audience, category } = req.query;

      const books = await BookService.searchBooks({
        query: q as string,
        audience: audience as string,
        category: category as string,
      });

      res.json({
        success: true,
        count: books.length,
        data: books,
      });
    } catch (err) {
      next(err);
    }
  },

  /* ======================================================
     CREATE BOOK (ADMIN ONLY)
     POST /api/books/admin
  ====================================================== */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ✅ Use Cloudinary URL if available, fallback to filename
      const coverImage =
        (req.file as any)?.secure_url ?? req.file?.path ?? req.file?.filename ?? "";

      const book = await BookService.createBook({
        ...req.body,
        coverImage,
      });

      res.status(201).json({
        success: true,
        message: "Book created successfully",
        data: book,
      });
    } catch (err) {
      next(err);
    }
  },

  /* ======================================================
     UPDATE BOOK (ADMIN ONLY)
     PUT /api/books/admin/:id
  ====================================================== */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ✅ Use Cloudinary URL if available
      const coverImage =
        (req.file as any)?.secure_url ?? req.file?.path ?? req.file?.filename;

      const updatedBook = await BookService.updateBook(req.params.id, {
        ...req.body,
        ...(coverImage && { coverImage }),
      });

      res.json({
        success: true,
        message: "Book updated successfully",
        data: updatedBook,
      });
    } catch (err) {
      next(err);
    }
  },

  /* ======================================================
     DELETE BOOK (ADMIN ONLY)
     DELETE /api/books/admin/:id
  ====================================================== */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await BookService.deleteBook(req.params.id);

      res.json({
        success: true,
        message: "Book deleted successfully",
      });
    } catch (err) {
      next(err);
    }
  },
};