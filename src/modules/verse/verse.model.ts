// src/modules/verse/verse.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IVerse extends Document {
  book: string;            // Revelation
  chapter: number;         // 21
  startVerse: number;      // 3
  endVerse?: number;       // 4 (optional)
  text: string;            // Full verse text
  translation: string;     // NWT, NIV, KJV
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
        validator: function (this: IVerse, value: number) {
          return !value || value >= this.startVerse;
        },
        message: "endVerse must be greater than or equal to startVerse"
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
  {
    timestamps: true
  }
);

/* =====================================================
   INDEXES (CRITICAL)
===================================================== */

// Prevent duplicate verses per translation
verseSchema.index(
  { book: 1, chapter: 1, startVerse: 1, endVerse: 1, translation: 1 },
  { unique: true }
);

// Fast random verse selection
verseSchema.index({ book: 1, translation: 1 });

export const Verse = mongoose.model<IVerse>(
  "Verse",
  verseSchema
);