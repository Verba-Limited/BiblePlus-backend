import { Request, Response, NextFunction } from "express";
import { BlogTrendingService } from "./blogTrending.service";

export const BlogTrendingController = {
  
  // ============================
  // GET GENERAL TRENDING BLOGS
  // ============================
  getTrending: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 20;
      const data = await BlogTrendingService.getTrending(limit);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // ============================
  // GET CATEGORY TRENDING
  // ============================
  getTrendingByCategory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = req.params.category;
      const limit = Number(req.query.limit) || 20;

      const data = await BlogTrendingService.getTrendingByCategory(category, limit);

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};
