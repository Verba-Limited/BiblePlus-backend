import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { BibleBook } from "../modules/bible/bibleBook.model";
import { BibleVerse } from "../modules/bible/bibleVerse.model";

dotenv.config({ path: __dirname + "/../../.env" });

const versions = [
  { file: "kjv.json", version: "KJV" },
  { file: "asv.json", version: "ASV" },
  { file: "web.json", version: "WEB" }
];

const MONGO_URI = process.env.MONGO_URI as string;

const importBible = async () => {
  try {
    console.log("⏳ Connecting to MongoDB...");
    await mongoose.connect(MONGO_URI);
    console.log("✅ MongoDB Connected");

    console.log("🗑 Clearing existing data...");
    await BibleBook.deleteMany({});
    await BibleVerse.deleteMany({});

    let booksMap: any = {};

    for (const v of versions) {
      const jsonPath = path.join(__dirname, v.file);
      const raw = fs.readFileSync(jsonPath, "utf-8");
      const data = JSON.parse(raw);

      console.log(`📘 Importing ${v.version}...`);

      for (let verse of data) {
        const { book_name, chapter, verse: verseNum, text } = verse;

        if (!booksMap[book_name]) {
          booksMap[book_name] = { chapters: 0 };
        }

        if (chapter > booksMap[book_name].chapters) {
          booksMap[book_name].chapters = chapter;
        }

        await BibleVerse.create({
          book: book_name,
          chapter,
          verse: verseNum,
          text,
          version: v.version
        });
      }
    }

    console.log("📕 Importing books...");
    const books = Object.keys(booksMap).map((name) => ({
      id: name.substring(0, 3).toUpperCase(),
      name,
      chapters: booksMap[name].chapters
    }));

    await BibleBook.insertMany(books);

    console.log("🎉 Import Complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Import Error:", error);
    process.exit(1);
  }
};

importBible();
