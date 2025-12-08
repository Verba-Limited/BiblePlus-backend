import mongoose, { Schema, Document } from "mongoose";

export interface IBlogLike extends Document {
  blogId: string;
  userId: string;
}

const blogLikeSchema = new Schema<IBlogLike>(
  {
    blogId: { type: String, required: true },
    userId: { type: String, required: true }
  },
  { timestamps: true }
);

// Prevent duplicate likes
blogLikeSchema.index({ blogId: 1, userId: 1 }, { unique: true });

export const BlogLike = mongoose.model<IBlogLike>("BlogLike", blogLikeSchema);
