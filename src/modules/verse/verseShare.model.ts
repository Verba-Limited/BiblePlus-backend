import mongoose, { Schema, Document } from "mongoose";

export interface IVerseShare extends Document {
  user: mongoose.Types.ObjectId;
  verse: mongoose.Types.ObjectId;
}

const verseShareSchema = new Schema<IVerseShare>(
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
    }
  },
  { timestamps: true }
);

export const VerseShare = mongoose.model<IVerseShare>(
  "VerseShare",
  verseShareSchema
);