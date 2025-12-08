import { BlogLike } from "./blogLike.model";
import AppError from "../../core/AppError";

export const BlogLikeService = {
  like: async (userId: string, blogId: string) => {
    try {
      return await BlogLike.create({ userId, blogId });
    } catch (err: any) {
      if (err.code === 11000) return { message: "Already liked" };
      throw err;
    }
  },

  unlike: async (userId: string, blogId: string) => {
    await BlogLike.deleteOne({ userId, blogId });
    return { message: "Like removed" };
  },

  count: async (blogId: string) => {
    return await BlogLike.countDocuments({ blogId });
  },

  userLiked: async (userId: string, blogId: string) => {
    return await BlogLike.findOne({ userId, blogId });
  }
};
