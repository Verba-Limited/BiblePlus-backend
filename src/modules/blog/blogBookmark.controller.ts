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
      const { blogId } = req.body;

      const data = await BlogBookmarkService.remove(userId, blogId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const data = await BlogBookmarkService.getUserBookmarks(userId);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  status: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const blogId = req.query.blogId as string;

      const bookmarked = await BlogBookmarkService.isBookmarked(userId, blogId);
      res.json({ success: true, bookmarked });
    } catch (err) {
      next(err);
    }
  }
};
