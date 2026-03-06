import mongoose, { Schema, Document } from "mongoose";

export interface IVerseComment extends Document {
  user: mongoose.Types.ObjectId;
  verse: mongoose.Types.ObjectId;
  comment: string;
}

const verseCommentSchema = new Schema<IVerseComment>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    verse: {
      type: Schema.Types.ObjectId,
      ref: "VerseOfDay",
      required: true
    },
    comment: {
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

export const VerseComment = mongoose.model<IVerseComment>(
  "VerseComment",
  verseCommentSchema
);