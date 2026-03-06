import mongoose, { Schema, Document } from "mongoose";

export type VerseReactionType =
  | "like"
  | "love"
  | "amen"
  | "powerful"
  | "sad";

export interface IVerseReaction extends Document {
  user: mongoose.Types.ObjectId;
  verse: mongoose.Types.ObjectId;
  reaction: VerseReactionType;
  createdAt: Date;
  updatedAt: Date;
}

const verseReactionSchema = new Schema<IVerseReaction>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    verse: {
      type: Schema.Types.ObjectId,
      ref: "VerseOfDay",
      required: true,
      index: true
    },

    reaction: {
      type: String,
      enum: ["like", "love", "amen", "powerful", "sad"],
      required: true
    }
  },
  {
    timestamps: true
  }
);

// one reaction per user per verse
verseReactionSchema.index({ user: 1, verse: 1 }, { unique: true });

export const VerseReaction = mongoose.model<IVerseReaction>(
  "VerseReaction",
  verseReactionSchema
);