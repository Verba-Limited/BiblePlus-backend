// src/modules/verse/verseOfDay.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IVerseOfDay extends Document {
  date: string; // YYYY-MM-DD

  reference: string; // Revelation 21:3-4
  book: string;      // Revelation
  chapter: number;   // 21
  verse: number;     // 3 (first verse)
  text: string;      // Verse content
  translation: string; // WEB, KJV, etc

  source: "admin" | "auto";
  locked: boolean;
}

const verseOfDaySchema = new Schema<IVerseOfDay>(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    reference: {
      type: String,
      required: true
    },

    book: {
      type: String,
      required: true
    },

    chapter: {
      type: Number,
      required: true
    },

    verse: {
      type: Number,
      required: true
    },

    text: {
      type: String,
      required: true
    },

    translation: {
      type: String,
      default: "WEB"
    },

    source: {
      type: String,
      enum: ["admin", "auto"],
      default: "auto"
    },

    locked: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const VerseOfDay = mongoose.model<IVerseOfDay>(
  "VerseOfDay",
  verseOfDaySchema
);