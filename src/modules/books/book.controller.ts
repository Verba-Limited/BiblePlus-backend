import { Request, Response, NextFunction } from "express";
import { BookService } from "./book.service";
import AppError from "../../core/AppError";
import { coerceTypes, readSearchTerm, sanitizeUpdate } from "../../utils/sanitize";

/* A multipart body arrives as strings — convert what the schema
   expects as numbers/booleans before Mongoose validates it. */
const normaliseBookBody = (body: any) =>
  coerceTypes(body || {}, {
    numbers: ["totalChapters", "gutenbergId"],
    booleans: ["isFetched"]
  });

/* multer-storage-cloudinary puts the hosted URL on `path`;
   a disk fallback only has `filename`. */
const coverImageFrom = (file?: Express.Multer.File) =>
  file
    ? (file as any).secure_url ?? file.path ?? file.filename ?? ""
    : undefined;

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
      const { audience, category } = req.query;

      // Accept ?q= , ?search= or ?query= — clients disagreed on the name
      const books = await BookService.searchBooks({
        query: readSearchTerm(req.query as any),
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
      const body = normaliseBookBody(req.body);

      // Fail with a clear message instead of a schema error further down
      if (!body.title || !String(body.title).trim()) {
        throw new AppError("Book title is required", 400);
      }

      // ✅ Use Cloudinary URL if available, fallback to filename.
      // No picture is fine — the cover is optional.
      const coverImage = coverImageFrom(req.file) ?? body.coverImage ?? "";

      const book = await BookService.createBook({
        ...body,
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
      const coverImage = coverImageFrom(req.file);

      // Strip `_id` and friends — the editor PUTs the whole record back
      const payload = sanitizeUpdate(normaliseBookBody(req.body));

      const updatedBook = await BookService.updateBook(req.params.id, {
        ...payload,
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