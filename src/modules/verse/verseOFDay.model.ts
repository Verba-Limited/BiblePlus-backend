// src/modules/verse/verseOfDay.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IVerseOfDay extends Document {
  date: string; // YYYY-MM-DD
  reference: string; // Rev 21:3-4
  book: string;
  chapter: number;
  verse: number;
  text: string;
  translation: string;
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
      required: true,
      index: true
    },

    chapter: {
      type: Number,
      required: true,
      min: 1
    },

    verse: {
      type: Number,
      required: true,
      min: 1
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