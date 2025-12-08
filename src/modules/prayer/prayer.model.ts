import mongoose, { Schema, Document } from "mongoose";

export interface IPrayer extends Document {
  userId: string;
  title: string;
  description: string;
  visibility: "public" | "private";
  status: "pending" | "approved" | "answered";
  image?: string;
  prayCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const prayerSchema = new Schema<IPrayer>(
  {
    userId: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public"
    },

    status: {
      type: String,
      enum: ["pending", "approved", "answered"],
      default: "pending"
    },

    image: { type: String, default: "" },

    prayCount: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const Prayer = mongoose.model<IPrayer>("Prayer", prayerSchema);
