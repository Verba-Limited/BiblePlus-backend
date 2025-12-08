import mongoose, { Schema, Document } from "mongoose";

export interface IBookChapter extends Document {
  bookId: string;
  chapterNumber: number;
  title: string;
  content: string; // long text
}

const bookChapterSchema = new Schema<IBookChapter>(
  {
    bookId: { type: String, required: true },
    chapterNumber: { type: Number, required: true },
    title: { type: String, default: "" },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

export const BookChapter = mongoose.model<IBookChapter>(
  "BookChapter",
  bookChapterSchema
);
