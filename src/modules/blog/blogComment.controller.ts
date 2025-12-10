import { Request, Response, NextFunction } from "express";
import { BlogCommentService } from "./blogComment.service";

export const BlogCommentController = {
  // -----------------------------------------------------
  // GET COMMENTS FOR A BLOG
  // -----------------------------------------------------
  getComments: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blogId = req.params.blogId;
      const data = await BlogCommentService.getComments(blogId);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // USER: CREATE COMMENT
  // -----------------------------------------------------
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const data = await BlogCommentService.create(userId, req.body);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // USER: UPDATE OWN COMMENT
  // -----------------------------------------------------
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commentId = req.params.id;
      // @ts-ignore
      const userId = req.userId;

      const updated = await BlogCommentService.update(commentId, userId, req.body);

      res.json({ success: true, data: updated });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // USER: DELETE OWN COMMENT
  // -----------------------------------------------------
  deleteOwn: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commentId = req.params.id;
      // @ts-ignore
      const userId = req.userId;

      await BlogCommentService.deleteOwn(commentId, userId);

      res.json({ success: true, message: "Comment deleted" });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // ADMIN: DELETE ANY COMMENT
  // -----------------------------------------------------
  adminDelete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const commentId = req.params.id;

      await BlogCommentService.adminDelete(commentId);

      res.json({ success: true, message: "Comment removed by admin" });
    } catch (err) {
      next(err);
    }
  }
};
