import mongoose, { Schema, Document } from "mongoose";

export interface IBibleBook extends Document {
  id: string;
  name: string;
  chapters: number;
}

const bibleBookSchema = new Schema<IBibleBook>({
  id: { type: String, required: true }, // e.g. GEN
  name: { type: String, required: true }, // Genesis
  chapters: { type: Number, required: true }
});

export const BibleBook = mongoose.model<IBibleBook>("BibleBook", bibleBookSchema);
