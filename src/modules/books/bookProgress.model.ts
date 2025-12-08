import mongoose, { Schema, Document } from "mongoose";

export interface IBookProgress extends Document {
  userId: string;
  bookId: string;
  currentChapter: number;
  percentage: number;
}

const bookProgressSchema = new Schema<IBookProgress>(
  {
    userId: { type: String, required: true },
    bookId: { type: String, required: true },
    currentChapter: { type: Number, default: 1 },
    percentage: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const BookProgress = mongoose.model<IBookProgress>(
  "BookProgress",
  bookProgressSchema
);
