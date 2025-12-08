import { BlogComment } from "./blogComment.model";
import AppError from "../../core/AppError";

export const BlogCommentService = {
  add: async (userId: string, blogId: string, text: string) => {
    return await BlogComment.create({ userId, blogId, text });
  },

  delete: async (id: string, userId: string, isAdmin: boolean) => {
    const comment = await BlogComment.findById(id);
    if (!comment) throw new AppError("Comment not found", 404);

    if (!isAdmin && comment.userId !== userId)
      throw new AppError("Not authorized", 403);

    await comment.deleteOne();
    return { message: "Comment deleted" };
  },

  list: async (blogId: string) => {
    return await BlogComment.find({ blogId }).sort({ createdAt: -1 });
  }
};
