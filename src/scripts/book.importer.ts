import mongoose from "mongoose";
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { Book } from "../modules/books/book.model";
import { BookChapter } from "../modules/books/bookChapter.model";

dotenv.config();

async function importBooks() {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log("✅ Connected to MongoDB");

    // Load JSON
    const dataPath = path.join(__dirname, "../data/books.json");
    const raw = fs.readFileSync(dataPath, "utf8");
    const books = JSON.parse(raw);

    if (!Array.isArray(books)) {
      throw new Error("books.json must be an array");
    }

    console.log(`📚 Found ${books.length} books in books.json`);

    for (const b of books) {
      console.log(`\n➕ Importing Book: ${b.title}`);

      // Create Book
      const book = await Book.create({
        title: b.title,
        author: b.author,
        description: b.description,
        coverImage: b.coverImage,
        category: b.category,
        audience: b.audience || "adults"  // ⭐ Auto-detect audience
      });

      const bookId = book._id.toString(); // ⭐ FIX for TypeScript
      console.log(`   ✔ Saved Book ID: ${bookId}`);

      // Import chapters
      if (Array.isArray(b.chapters)) {
        for (const ch of b.chapters) {
          await BookChapter.create({
            bookId,
            chapterNumber: ch.chapterNumber,
            title: ch.title,
            content: ch.content
          });
        }

        console.log(`   📖 Imported ${b.chapters.length} chapters`);
      } else {
        console.log("   ⚠ No chapters found for this book");
      }
    }

    console.log("\n🎉 ALL BOOKS IMPORTED SUCCESSFULLY!");
    process.exit(0);
  } catch (err: any) {
    console.error("❌ Error importing books:", err.message || err);
    process.exit(1);
  }
}

importBooks();
