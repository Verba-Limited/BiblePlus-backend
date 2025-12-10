import { BlogLike } from "./blogLike.model";
import AppError from "../../core/AppError";

export const BlogLikeService = {
  // -----------------------------------------------------
  // LIKE BLOG
  // -----------------------------------------------------
  like: async (userId: string, blogId: string) => {
    if (!blogId) throw new AppError("blogId is required", 400);

    const exists = await BlogLike.findOne({ userId, blogId });
    if (exists) return exists;

    return await BlogLike.create({ userId, blogId });
  },

  // -----------------------------------------------------
  // UNLIKE BLOG
  // -----------------------------------------------------
  unlike: async (userId: string, blogId: string) => {
    if (!blogId) throw new AppError("blogId is required", 400);

    return await BlogLike.findOneAndDelete({ userId, blogId });
  },

  // -----------------------------------------------------
  // CHECK LIKE STATUS
  // -----------------------------------------------------
  status: async (userId: string, blogId: string) => {
    const exists = await BlogLike.findOne({ userId, blogId });
    return !!exists;
  },

  // -----------------------------------------------------
  // PUBLIC COUNT
  // -----------------------------------------------------
  count: async (blogId: string) => {
    return await BlogLike.countDocuments({ blogId });
  }
};
