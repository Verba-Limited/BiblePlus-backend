import { BlogBookmark } from "./blogBookmark.model";
import AppError from "../../core/AppError";
import { Types } from "mongoose";

export const BlogBookmarkService = {
  add: async (userId: string, blogId: string) => {
    try {
      return await BlogBookmark.create({
        userId: new Types.ObjectId(userId),
        blogId: new Types.ObjectId(blogId),
      });
    } catch (err: any) {
      if (err.code === 11000) throw new AppError("Already bookmarked", 400);
      throw err;
    }
  },

  remove: async (userId: string, blogId: string) => {
    const removed = await BlogBookmark.findOneAndDelete({
      userId,
      blogId,
    });

    if (!removed) throw new AppError("Bookmark not found", 404);

    return removed;
  },

  list: async (userId: string, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;

    const items = await BlogBookmark.find({ userId })
      .populate("blogId")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await BlogBookmark.countDocuments({ userId });

    return {
      items,
      pagination: {
        total,
        page,
        pages: Math.ceil(total / limit),
      },
    };
  },

  status: async (userId: string, blogId: string) => {
    return Boolean(await BlogBookmark.exists({ userId, blogId }));
  },
};
