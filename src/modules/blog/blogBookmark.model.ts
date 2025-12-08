import mongoose, { Schema, Document } from "mongoose";

export interface IBlogBookmark extends Document {
  userId: string;
  blogId: string;
}

const bookmarkSchema = new Schema<IBlogBookmark>(
  {
    userId: { type: String, required: true },
    blogId: { type: String, required: true }
  },
  { timestamps: true }
);

// Prevent duplicate bookmarks
bookmarkSchema.index({ userId: 1, blogId: 1 }, { unique: true });

export const BlogBookmark = mongoose.model<IBlogBookmark>(
  "BlogBookmark",
  bookmarkSchema
);
