import AppError from "../../core/AppError";
import { Book } from "./book.model";
import { BookChapter } from "./bookChapter.model";

export const BookService = {
  // -----------------------------------------------------
  // GET ALL BOOKS WITH FILTERS
  // Example:
  // /api/books?audience=kids&category=stories
  // -----------------------------------------------------
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

  // -----------------------------------------------------
  // GET SINGLE BOOK
  // -----------------------------------------------------
  getBook: async (bookId: string) => {
    const book = await Book.findById(bookId);
    if (!book) throw new AppError("Book not found", 404);
    return book;
  },

  // -----------------------------------------------------
  // GET ALL CHAPTERS OF A BOOK
  // -----------------------------------------------------
  getChapters: async (bookId: string) => {
    return await BookChapter.find({ bookId }).sort({ chapterNumber: 1 });
  },

  // -----------------------------------------------------
  // GET ONE CHAPTER OF A BOOK
  // -----------------------------------------------------
  getChapter: async (bookId: string, chapterNumber: number) => {
    const chapter = await BookChapter.findOne({ bookId, chapterNumber });
    if (!chapter) throw new AppError("Chapter not found", 404);
    return chapter;
  },

  // -----------------------------------------------------
  // SEARCH BOOKS (Supports keyword + audience + category)
  // Example:
  // /api/books/search?q=david&audience=kids
  // -----------------------------------------------------
  searchBooks: async (filters: {
    query?: string;
    audience?: string;
    category?: string;
  }) => {
    const query: any = {};

    // keyword search
    if (filters.query) {
      query.title = { $regex: filters.query, $options: "i" };
    }

    // audience filter
    if (filters.audience) {
      query.audience = filters.audience;
    }

    // category filter
    if (filters.category) {
      query.category = filters.category;
    }

    return await Book.find(query).sort({ createdAt: -1 });
  }
};
