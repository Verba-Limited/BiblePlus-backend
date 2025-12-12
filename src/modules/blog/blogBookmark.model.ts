import mongoose, { Schema, Document, Types } from "mongoose";

export interface IBlogBookmark extends Document {
  userId: Types.ObjectId;
  blogId: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookmarkSchema = new Schema<IBlogBookmark>({
  userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
  blogId: { type: Schema.Types.ObjectId, ref: "Blog", required: true, index: true }
}, { timestamps: true });

// prevent duplicate bookmarks per user/blog
bookmarkSchema.index({ userId: 1, blogId: 1 }, { unique: true });

export const BlogBookmark = mongoose.model<IBlogBookmark>("BlogBookmark", bookmarkSchema);
