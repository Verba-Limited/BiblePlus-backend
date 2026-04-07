import mongoose, { Schema, Types } from "mongoose";

export interface IPrayer {
  user: Types.ObjectId; // reference to User
  title: string;
  description: string;
  visibility: "public" | "private";
  isAnswered: boolean;
  image?: string;
  prayCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const prayerSchema = new Schema<IPrayer>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000
    },

    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
      index: true
    },

    // ✅ user can mark their prayer answered
    isAnswered: {
      type: Boolean,
      default: false,
      index: true
    },

    image: {
      type: String,
      default: ""
    },

    prayCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  { timestamps: true }
);

/* =========================================
   INDEXES (important for scaling)
========================================= */

// Public feed performance
prayerSchema.index({ visibility: 1, createdAt: -1 });

// User profile performance
prayerSchema.index({ user: 1, createdAt: -1 });

export const Prayer = mongoose.model<IPrayer>("Prayer", prayerSchema);