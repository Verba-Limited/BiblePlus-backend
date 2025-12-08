import mongoose, { Schema, Document } from "mongoose";

export interface IBook extends Document {
  title: string;
  author: string;
  description: string;
  coverImage: string;
  category: string;
  audience: "kids" | "teens" | "adults";   // ⭐ NEW
  publishedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bookSchema = new Schema<IBook>(
  {
    title: { type: String, required: true },
    author: { type: String, default: "Unknown" },
    description: { type: String, default: "" },
    coverImage: { type: String, default: "" },
    category: { type: String, default: "general" },

    // ⭐ NEW FIELD (Kids, Teens, Adults)
    audience: {
      type: String,
      enum: ["kids", "teens", "adults"],
      default: "adults"
    },

    publishedAt: { type: Date, default: new Date() }
  },
  { timestamps: true }
);

export const Book = mongoose.model<IBook>("Book", bookSchema);
