// src/modules/verse/verseOfDay.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IVerseOfDay extends Document {
  date: string; // YYYY-MM-DD
  verse: mongoose.Types.ObjectId;
  source: "admin" | "auto";
}

const verseOfDaySchema = new Schema<IVerseOfDay>(
  {
    date: { type: String, required: true, unique: true },
    verse: {
      type: Schema.Types.ObjectId,
      ref: "Verse",
      required: true
    },
    source: {
      type: String,
      enum: ["admin", "auto"],
      default: "auto"
    }
  },
  { timestamps: true }
);

export const VerseOfDay = mongoose.model<IVerseOfDay>(
  "VerseOfDay",
  verseOfDaySchema
);