import mongoose, { Schema, Document } from "mongoose";

export interface IHighlight extends Document {
  userId: string;
  book: string;
  chapter: number;
  verse: number;
  text: string;
  version: string;
}

const highlightSchema = new Schema<IHighlight>(
  {
    userId: { type: String, required: true },
    book: { type: String, required: true },
    chapter: { type: Number, required: true },
    verse: { type: Number, required: true },
    text: { type: String, required: true },
    version: { type: String, required: true }
  },
  { timestamps: true }
);

export const Highlight = mongoose.model<IHighlight>("Highlight", highlightSchema);
