import mongoose, { Schema, Document } from "mongoose";

export interface IBookFavorite extends Document {
  userId: string;
  bookId: string;
}

const bookFavoriteSchema = new Schema<IBookFavorite>(
  {
    userId: { type: String, required: true },
    bookId: { type: String, required: true }
  },
  { timestamps: true }
);

export const BookFavorite = mongoose.model<IBookFavorite>(
  "BookFavorite",
  bookFavoriteSchema
);
