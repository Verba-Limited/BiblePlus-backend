import mongoose, { Schema, Document, Types } from "mongoose";

export interface IVerseComment extends Document {
  user: Types.ObjectId;
  verse: Types.ObjectId;
  comment: string;
  parentComment?: Types.ObjectId;
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
    },

    parentComment: {
      type: Schema.Types.ObjectId,
      ref: "VerseComment",
      required: false
    }

  },
  { timestamps: true }
);

export const VerseComment = mongoose.model<IVerseComment>(
  "VerseComment",
  verseCommentSchema
);