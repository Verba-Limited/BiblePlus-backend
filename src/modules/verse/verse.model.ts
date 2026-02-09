// src/modules/verse/verse.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IVerse extends Document {
  book: string;        // Revelation
  chapter: number;     // 21
  startVerse: number;  // 3
  endVerse?: number;   // 4
  text: string;        // Full verse text
  translation: string; // NWT, NIV, KJV
}

const verseSchema = new Schema<IVerse>(
  {
    book: { type: String, required: true },
    chapter: { type: Number, required: true },
    startVerse: { type: Number, required: true },
    endVerse: { type: Number },
    text: { type: String, required: true },
    translation: { type: String, default: "NWT" }
  },
  { timestamps: true }
);

export const Verse = mongoose.model<IVerse>("Verse", verseSchema);