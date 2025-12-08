import { BlogBookmark } from "./blogBookmark.model";
import AppError from "../../core/AppError";

export const BlogBookmarkService = {
  add: async (userId: string, blogId: string) => {
    try {
      return await BlogBookmark.create({ userId, blogId });
    } catch (err: any) {
      if (err.code === 11000) {
        return { message: "Already bookmarked" };
      }
      throw err;
    }
  },

  remove: async (userId: string, blogId: string) => {
    await BlogBookmark.deleteOne({ userId, blogId });
    return { message: "Bookmark removed" };
  },

  getUserBookmarks: async (userId: string) => {
    return await BlogBookmark.find({ userId }).sort({ createdAt: -1 });
  },

  isBookmarked: async (userId: string, blogId: string) => {
    const exists = await BlogBookmark.findOne({ userId, blogId });
    return !!exists;
  }
};
