import mongoose, { Schema, Document } from "mongoose";

export interface IBlogComment extends Document {
  blogId: string;
  userId: string;
  text: string;
}

const blogCommentSchema = new Schema<IBlogComment>(
  {
    blogId: { type: String, required: true },
    userId: { type: String, required: true },
    text: { type: String, required: true }
  },
  { timestamps: true }
);

export const BlogComment = mongoose.model<IBlogComment>(
  "BlogComment",
  blogCommentSchema
);
