import mongoose, { Schema, Document } from "mongoose";

export interface IVerseLike extends Document {
  user: mongoose.Types.ObjectId;
  verse: mongoose.Types.ObjectId;
  createdAt: Date;
}

const verseLikeSchema = new Schema<IVerseLike>(
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

verseLikeSchema.index({ user: 1, verse: 1 }, { unique: true });

export const VerseLike = mongoose.model<IVerseLike>(
  "VerseLike",
  verseLikeSchema
);