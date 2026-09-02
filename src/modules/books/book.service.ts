import AppError from "../../core/AppError";
import { Book } from "./book.model";
import { BookChapter } from "./bookChapter.model";
import { fetchAndCacheChapters } from "./gutenberg.service";
import { EmailService } from "../../services/email.service";
import { escapeRegex, sanitizeUpdate } from "../../utils/sanitize";

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

    // Escape the term so a title with "(" or "+" searches literally
    // instead of blowing up as an invalid regular expression.
    const term = (filters.query || "").trim();
    if (term) {
      const safe = escapeRegex(term);
      query.$or = [
        { title: { $regex: safe, $options: "i" } },
        { author: { $regex: safe, $options: "i" } },
        { description: { $regex: safe, $options: "i" } }
      ];
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

    setImmediate(() => {
      EmailService.sendNewBookToAll(book).catch(console.error);
    });

    return book;
  },

  /* =====================================================
      UPDATE BOOK (ADMIN)
      PUT /api/books/admin/:id
  ===================================================== */
  updateBook: async (bookId: string, data: any) => {
    // The admin editor sends the whole record back, `_id` included,
    // and Mongo refuses any update that touches an immutable path.
    const payload = sanitizeUpdate(data, ["source", "gutenbergId"]);

    const updated = await Book.findByIdAndUpdate(bookId, payload, {
      returnDocument: "after",
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