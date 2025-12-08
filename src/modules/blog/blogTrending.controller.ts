import { Request, Response, NextFunction } from "express";
import { BlogTrendingService } from "./blogTrending.service";

export const BlogTrendingController = {
  getTrending: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await BlogTrendingService.getTrending();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};
