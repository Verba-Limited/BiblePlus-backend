import mongoose, { Schema, Document } from "mongoose";

export interface IBibleVerse extends Document {
  book: string;
  chapter: number;
  verse: number;
  text: string;
  version: string; // KJV, ASV, WEB
}

const bibleVerseSchema = new Schema<IBibleVerse>({
  book: { type: String, required: true },
  chapter: { type: Number, required: true },
  verse: { type: Number, required: true },
  text: { type: String, required: true },
  version: { type: String, required: true }
});

// Fast index for multi-version lookups
bibleVerseSchema.index({ book: 1, chapter: 1, version: 1 });

export const BibleVerse = mongoose.model<IBibleVerse>("BibleVerse", bibleVerseSchema);
