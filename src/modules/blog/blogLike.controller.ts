import { Request, Response, NextFunction } from "express";
import { BlogLikeService } from "./blogLike.service";
import { AuthRequest } from "../../types/auth.types";

export const BlogLikeController = {
  // -----------------------------------------------------
  // USER: LIKE BLOG
  // -----------------------------------------------------
  like: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { blogId } = req.body;

      const data = await BlogLikeService.like(userId, blogId);

      res.json({ success: true, message: "Blog liked", data });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // USER: UNLIKE BLOG
  // -----------------------------------------------------
  unlike: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { blogId } = req.body;

      const data = await BlogLikeService.unlike(userId, blogId);

      res.json({ success: true, message: "Blog unliked", data });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // USER: CHECK LIKE STATUS
  // -----------------------------------------------------
  status: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const blogId = req.query.blogId as string;

      const liked = await BlogLikeService.status(userId, blogId);

      res.json({ success: true, liked });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // PUBLIC: LIKE COUNT
  // -----------------------------------------------------
  count: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const blogId = req.params.blogId;

      const total = await BlogLikeService.count(blogId);

      res.json({ success: true, total });
    } catch (err) {
      next(err);
    }
  }
};
