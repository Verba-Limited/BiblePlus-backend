import { Request, Response, NextFunction } from "express";
import { BlogBookmarkService } from "./blogBookmark.service";

export const BlogBookmarkController = {
  add: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { blogId } = req.body;

      const data = await BlogBookmarkService.add(userId, blogId);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { blogId } = req.params;

      await BlogBookmarkService.remove(userId, blogId);

      res.json({ success: true, message: "Bookmark removed" });
    } catch (err) {
      next(err);
    }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const { page = 1, limit = 20 } = req.query;

      const data = await BlogBookmarkService.list(
        userId,
        Number(page),
        Number(limit)
      );

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  status: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const { blogId } = req.params;

      const bookmarked = await BlogBookmarkService.status(userId, blogId);

      res.json({ success: true, bookmarked });
    } catch (err) {
      next(err);
    }
  }
};
