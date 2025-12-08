import { Request, Response, NextFunction } from "express";
import { EventCategoryService } from "./eventCategory.service";

export const EventCategoryController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await EventCategoryService.create(req.body);
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const category = await EventCategoryService.update(req.params.id, req.body);
      res.json({ success: true, data: category });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await EventCategoryService.delete(req.params.id);
      res.json({ success: true, message: "Category deleted" });
    } catch (err) {
      next(err);
    }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const categories = await EventCategoryService.list();
      res.json({ success: true, data: categories });
    } catch (err) {
      next(err);
    }
  }
};
