import { Request, Response, NextFunction } from "express";
import { BlogCommentService } from "./blogComment.service";

export const BlogCommentController = {
  add: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { blogId, text } = req.body;

      const data = await BlogCommentService.add(userId, blogId, text);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      // @ts-ignore
      const isAdmin = req.isAdmin || false;

      const data = await BlogCommentService.delete(req.params.id, userId, isAdmin);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comments = await BlogCommentService.list(req.params.blogId);
      res.json({ success: true, data: comments });
    } catch (err) {
      next(err);
    }
  }
};
