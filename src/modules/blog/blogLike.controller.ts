import { Request, Response, NextFunction } from "express";
import { BlogLikeService } from "./blogLike.service";

export const BlogLikeController = {
  like: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { blogId } = req.body;

      const data = await BlogLikeService.like(userId, blogId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  unlike: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { blogId } = req.body;

      const data = await BlogLikeService.unlike(userId, blogId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  count: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const count = await BlogLikeService.count(req.params.blogId);
      res.json({ success: true, count });
    } catch (err) {
      next(err);
    }
  }
};
