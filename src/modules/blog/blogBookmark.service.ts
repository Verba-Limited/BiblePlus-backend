import { BlogBookmark } from "./blogBookmark.model";
import AppError from "../../core/AppError";

export const BlogBookmarkService = {
  // Add blog to bookmark
  add: async (userId: string, blogId: string) => {
    if (!blogId) throw new AppError("blogId is required", 400);

    try {
      return await BlogBookmark.create({ userId, blogId });
    } catch (err: any) {
      if (err.code === 11000) {
        throw new AppError("Already bookmarked", 400);
      }
      throw err;
    }
  },

  // Remove bookmark
  remove: async (userId: string, blogId: string) => {
    if (!blogId) throw new AppError("blogId is required", 400);

    return await BlogBookmark.findOneAndDelete({ userId, blogId });
  },

  // List all bookmarked blogs
  list: async (userId: string) => {
    return await BlogBookmark.find({ userId }).populate("blogId");
  },

  // Check if blog is bookmarked
  status: async (userId: string, blogId: string) => {
    const exists = await BlogBookmark.findOne({ userId, blogId });
    return !!exists;
  }
};
