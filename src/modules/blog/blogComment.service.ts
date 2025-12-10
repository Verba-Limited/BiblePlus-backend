import { BlogComment } from "./blogComment.model";
import AppError from "../../core/AppError";

export const BlogCommentService = {
  // -----------------------------------------------------
  // GET ALL COMMENTS FOR A BLOG (PUBLIC)
  // -----------------------------------------------------
  getComments: async (blogId: string) => {
    return await BlogComment.find({ blogId })
      .populate("userId", "name email")
      .sort({ createdAt: -1 });
  },

  // -----------------------------------------------------
  // USER: CREATE COMMENT
  // -----------------------------------------------------
  create: async (userId: string, data: any) => {
    if (!data.blogId || !data.text) {
      throw new AppError("blogId and text are required", 400);
    }

    return await BlogComment.create({
      userId,
      blogId: data.blogId,
      text: data.text
    });
  },

  // -----------------------------------------------------
  // USER: UPDATE OWN COMMENT
  // -----------------------------------------------------
  update: async (commentId: string, userId: string, data: any) => {
    const comment = await BlogComment.findById(commentId);

    if (!comment) throw new AppError("Comment not found", 404);
    if (comment.userId.toString() !== userId) {
      throw new AppError("You cannot edit this comment", 403);
    }

    comment.text = data.text || comment.text;

    await comment.save();
    return comment;
  },

  // -----------------------------------------------------
  // USER: DELETE OWN COMMENT
  // -----------------------------------------------------
  deleteOwn: async (commentId: string, userId: string) => {
    const comment = await BlogComment.findById(commentId);

    if (!comment) throw new AppError("Comment not found", 404);
    if (comment.userId.toString() !== userId) {
      throw new AppError("You cannot delete this comment", 403);
    }

    await comment.deleteOne();
  },

  // -----------------------------------------------------
  // ADMIN: DELETE ANY COMMENT
  // -----------------------------------------------------
  adminDelete: async (commentId: string) => {
    const comment = await BlogComment.findById(commentId);

    if (!comment) throw new AppError("Comment not found", 404);

    await comment.deleteOne();
  }
};
