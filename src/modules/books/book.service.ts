import AppError from "../../core/AppError";
import { Book } from "./book.model";
import { BookChapter } from "./bookChapter.model";
import { fetchAndCacheChapters } from "./gutenberg.service";

export const BookService = {

  /* =====================================================
     GET ALL BOOKS
  ===================================================== */
  getBooks: async (filters: { category?: string; audience?: string }) => {
    const query: any = {};
    if (filters.category) query.category = filters.category;
    if (filters.audience) query.audience = filters.audience;

    return await Book.find(query).sort({ createdAt: -1 });
  },

  /* =====================================================
     GET SINGLE BOOK
  ===================================================== */
  getBook: async (bookId: string) => {
    const book = await Book.findById(bookId);
    if (!book) throw new AppError("Book not found", 404);
    return book;
  },

  /* =====================================================
     GET CHAPTERS — lazy fetch from Gutenberg if needed
  ===================================================== */
  getChapters: async (bookId: string) => {
    const book = await Book.findById(bookId);
    if (!book) throw new AppError("Book not found", 404);

    // ✅ If Gutenberg book and not yet fetched — fetch now
    if (book.source === "gutenberg" && !book.isFetched) {
      await fetchAndCacheChapters(book);
    }

    // Return chapter list WITHOUT content (fast — just titles)
    return await BookChapter.find({ bookId })
      .select("-content") // ✅ Don't send full content in list
      .sort({ chapterNumber: 1 });
  },

  /* =====================================================
     GET SINGLE CHAPTER (full content)
  ===================================================== */
getChapters: async (bookId: string) => {
  const book = await Book.findById(bookId);
  if (!book) throw new AppError("Book not found", 404);

  // ✅ If not yet fetched — fetch now and return isFetching flag
  if (book.source === "gutenberg" && !book.isFetched) {
    // Start fetch in background — don't await so response is immediate
    fetchAndCacheChapters(book).catch(console.error);

    return {
      isFetching: true,
      chapters: []
    };
  }

  const chapters = await BookChapter.find({ bookId })
    .select("-content")
    .sort({ chapterNumber: 1 });

  return {
    isFetching: false,
    chapters
  };
},

  /* =====================================================
     SEARCH BOOKS
  ===================================================== */
  searchBooks: async (filters: {
    query?: string;
    audience?: string;
    category?: string;
  }) => {
    const query: any = {};
    if (filters.query) query.title = { $regex: filters.query, $options: "i" };
    if (filters.audience) query.audience = filters.audience;
    if (filters.category) query.category = filters.category;

    return await Book.find(query).sort({ createdAt: -1 });
  },

  /* =====================================================
     CREATE BOOK (ADMIN)
  ===================================================== */
  createBook: async (data: any) => {
    if (!data.title) throw new AppError("Book title is required", 400);
    data.source = "admin";
    data.isFetched = true; // Admin books don't need Gutenberg fetch
    return await Book.create(data);
  },

  /* =====================================================
     UPDATE BOOK (ADMIN)
  ===================================================== */
  updateBook: async (bookId: string, data: any) => {
    const updated = await Book.findByIdAndUpdate(bookId, data, {
      new: true,
      runValidators: true
    });
    if (!updated) throw new AppError("Book not found", 404);
    return updated;
  },

  /* =====================================================
     DELETE BOOK (ADMIN)
  ===================================================== */
  deleteBook: async (bookId: string) => {
    const deleted = await Book.findByIdAndDelete(bookId);
    if (!deleted) throw new AppError("Book not found", 404);
    await BookChapter.deleteMany({ bookId });
    return true;
  },
};