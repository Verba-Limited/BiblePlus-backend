// src/modules/verse/verse.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IVerse extends Document {
  book: string;
  chapter: number;
  startVerse: number;
  endVerse?: number;
  text: string;
  translation: string;
}

const verseSchema = new Schema<IVerse>(
  {
    book: {
      type: String,
      required: true,
      trim: true,
      index: true
    },

    chapter: {
      type: Number,
      required: true,
      min: 1
    },

    startVerse: {
      type: Number,
      required: true,
      min: 1
    },

    endVerse: {
      type: Number,
      min: 1,
      validate: {
        // 👇 TS-safe mongoose validator
        validator: function (this: any, value?: number) {
          if (value === undefined) return true;
          return value >= this.startVerse;
        },
        message:
          "endVerse must be greater than or equal to startVerse"
      }
    },

    text: {
      type: String,
      required: true,
      trim: true
    },

    translation: {
      type: String,
      default: "NWT",
      uppercase: true,
      trim: true,
      index: true
    }
  },
  { timestamps: true }
);

/* =====================================================
   INDEXES
===================================================== */

// Prevent duplicate verses per translation
verseSchema.index(
  {
    book: 1,
    chapter: 1,
    startVerse: 1,
    endVerse: 1,
    translation: 1
  },
  { unique: true }
);

export const Verse = mongoose.model<IVerse>(
  "Verse",
  verseSchema
);