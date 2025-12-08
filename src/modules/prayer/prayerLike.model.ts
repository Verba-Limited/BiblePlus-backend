import mongoose, { Schema, Document } from "mongoose";

export interface IPrayerLike extends Document {
  userId: string;
  prayerId: string;
}

const prayerLikeSchema = new Schema<IPrayerLike>(
  {
    userId: { type: String, required: true },
    prayerId: { type: String, required: true }
  },
  { timestamps: true }
);

// Prevent duplicate “prays”
prayerLikeSchema.index({ userId: 1, prayerId: 1 }, { unique: true });

export const PrayerLike = mongoose.model<IPrayerLike>(
  "PrayerLike",
  prayerLikeSchema
);
