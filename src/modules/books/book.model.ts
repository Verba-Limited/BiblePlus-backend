import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: string;
  description: string;
  coverImage: string;
  category: string;
  audience: "kids" | "teens" | "adults";
  gutenbergId?: number;        // ✅ Gutenberg book ID
  source: "admin" | "gutenberg"; // ✅ track where it came from
  totalChapters: number;
  isFetched: boolean;          // ✅ have chapters been downloaded yet
  publishedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true },
    author: { type: String, default: "Unknown" },
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    category: { type: String, default: "general" },
    audience: {
      type: String,
      enum: ["kids", "teens", "adults"],
      default: "adults"
    },
    gutenbergId: { type: Number },
    source: {
      type: String,
      enum: ["admin", "gutenberg"],
      default: "admin"
    },
    totalChapters: { type: Number, default: 0 },
    isFetched: { type: Boolean, default: false },
    publishedAt: { type: Date, default: new Date() }
  },
  { timestamps: true }
);

// ✅ Fast search
bookSchema.index({ title: "text", author: "text" });
bookSchema.index({ source: 1, isFetched: 1 });

export const Book = mongoose.model<IBook>("Book", bookSchema);