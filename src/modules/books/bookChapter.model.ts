import mongoose, { Schema, Document } from "mongoose";

export interface IBookChapter extends Document {
  bookId: mongoose.Types.ObjectId;
  chapterNumber: number;
  title: string;
  content: string;
}

const bookChapterSchema = new Schema<IBookChapter>(
  {
    bookId: {
      type: Schema.Types.ObjectId,
      ref: "Book",
      required: true,
      index: true
    },
    chapterNumber: { type: Number, required: true },
    title: { type: String, default: "" },
    content: { type: String, required: true }
  },
  { timestamps: true }
);

// ✅ Fast lookup by book + chapter number
bookChapterSchema.index({ bookId: 1, chapterNumber: 1 }, { unique: true });

export const BookChapter = mongoose.model<IBookChapter>(
  "BookChapter",
  bookChapterSchema
);