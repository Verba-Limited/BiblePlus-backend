import mongoose, { Schema, Document } from "mongoose";

export interface IBlogLike extends Document {
  userId: mongoose.Types.ObjectId;
  blogId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BlogLikeSchema = new Schema<IBlogLike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true },
  },
  { timestamps: true }
);

/* ===================================
   INDEXES FOR PERFORMANCE
=================================== */

// Prevent double-like
BlogLikeSchema.index({ userId: 1, blogId: 1 }, { unique: true });

// Query likes by blog
BlogLikeSchema.index({ blogId: 1 });

// Query likes within time range for trending
BlogLikeSchema.index({ createdAt: -1 });

export const BlogLike = mongoose.model<IBlogLike>("BlogLike", BlogLikeSchema);
