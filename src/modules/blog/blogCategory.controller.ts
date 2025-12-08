import { Request, Response, NextFunction } from "express";
import { BlogCategoryService } from "./blogCategory.service";

export const BlogCategoryController = {
  // ------------------------------------------
  // CREATE CATEGORY (Admin)
  // ------------------------------------------
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await BlogCategoryService.create(req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // ------------------------------------------
  // UPDATE CATEGORY (Admin)
  // ------------------------------------------
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await BlogCategoryService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  // ------------------------------------------
  // DELETE CATEGORY (Admin)
  // ------------------------------------------
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await BlogCategoryService.delete(req.params.id);
      res.json({ success: true, message: "Category deleted" });
    } catch (err) {
      next(err);
    }
  },

  // ------------------------------------------
  // LIST ALL CATEGORIES (Public)
  // ------------------------------------------
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await BlogCategoryService.list();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  }
};
