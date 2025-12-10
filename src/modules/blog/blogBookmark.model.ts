import mongoose, { Schema, Document } from "mongoose";

export interface IBlogBookmark extends Document {
  userId: mongoose.Types.ObjectId;
  blogId: mongoose.Types.ObjectId;
  createdAt: Date;
}

const BlogBookmarkSchema = new Schema<IBlogBookmark>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true }
  },
  { timestamps: true }
);

/* ============================================
   INDEXES
============================================ */

// Prevent same blog from being bookmarked twice
BlogBookmarkSchema.index({ userId: 1, blogId: 1 }, { unique: true });

// Find all bookmarks of a user
BlogBookmarkSchema.index({ userId: 1 });

// Find all users who bookmarked a blog
BlogBookmarkSchema.index({ blogId: 1 });

export const BlogBookmark = mongoose.model<IBlogBookmark>(
  "BlogBookmark",
  BlogBookmarkSchema
);
