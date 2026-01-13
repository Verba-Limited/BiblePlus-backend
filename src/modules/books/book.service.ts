import AppError from "../../core/AppError";
import { Book } from "./book.model";
import { BookChapter } from "./bookChapter.model";

export const BookService = {
  /* =====================================================
      GET ALL BOOKS (with filters)
      /api/books?audience=&category=
  ===================================================== */
  getBooks: async (filters: { category?: string; audience?: string }) => {
    const query: any = {};

    if (filters.category) {
      query.category = filters.category;
    }

    if (filters.audience) {
      query.audience = filters.audience;
    }

    return await Book.find(query).sort({ createdAt: -1 });
  },

  /* =====================================================
      GET SINGLE BOOK
      /api/books/:id
  ===================================================== */
  getBook: async (bookId: string) => {
    const book = await Book.findById(bookId);
    if (!book) throw new AppError("Book not found", 404);
    return book;
  },

  /* =====================================================
      GET ALL CHAPTERS OF A BOOK
      /api/books/:id/chapters
  ===================================================== */
  getChapters: async (bookId: string) => {
    return await BookChapter.find({ bookId }).sort({
      chapterNumber: 1,
    });
  },

  /* =====================================================
      GET SINGLE CHAPTER
      /api/books/:id/chapter/:chapter
  ===================================================== */
  getChapter: async (bookId: string, chapterNumber: number) => {
    const chapter = await BookChapter.findOne({
      bookId,
      chapterNumber,
    });

    if (!chapter) throw new AppError("Chapter not found", 404);
    return chapter;
  },

  /* =====================================================
      SEARCH BOOKS
      /api/books/search?q=&audience=&category=
  ===================================================== */
  searchBooks: async (filters: {
    query?: string;
    audience?: string;
    category?: string;
  }) => {
    const query: any = {};

    if (filters.query) {
      query.title = { $regex: filters.query, $options: "i" };
    }

    if (filters.audience) {
      query.audience = filters.audience;
    }

    if (filters.category) {
      query.category = filters.category;
    }

    return await Book.find(query).sort({ createdAt: -1 });
  },

  /* =====================================================
      CREATE BOOK (ADMIN)
      POST /api/books/admin
  ===================================================== */
  createBook: async (data: any) => {
    if (!data.title) {
      throw new AppError("Book title is required", 400);
    }

    const book = await Book.create(data);
    return book;
  },

  /* =====================================================
      UPDATE BOOK (ADMIN)
      PUT /api/books/admin/:id
  ===================================================== */
  updateBook: async (bookId: string, data: any) => {
    const updated = await Book.findByIdAndUpdate(bookId, data, {
      new: true,
      runValidators: true,
    });

    if (!updated) {
      throw new AppError("Book not found", 404);
    }

    return updated;
  },

  /* =====================================================
      DELETE BOOK (ADMIN)
      DELETE /api/books/admin/:id
  ===================================================== */
  deleteBook: async (bookId: string) => {
    const deleted = await Book.findByIdAndDelete(bookId);

    if (!deleted) {
      throw new AppError("Book not found", 404);
    }

    // Optional: delete chapters too
    await BookChapter.deleteMany({ bookId });

    return true;
  },
};