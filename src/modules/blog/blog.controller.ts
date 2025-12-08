import { Request, Response, NextFunction } from "express";
import { BlogService } from "./blog.service";

export const BlogController = {
  // -----------------------------------------------------
  // ADMIN: CREATE BLOG
  // -----------------------------------------------------
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const authorId = req.userId;

      const data = await BlogService.createBlog({
        ...req.body,
        authorId
      });

      res.json({
        success: true,
        message: "Blog created successfully",
        data
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // ADMIN: UPDATE BLOG
  // -----------------------------------------------------
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await BlogService.updateBlog(req.params.id, req.body);

      res.json({
        success: true,
        message: "Blog updated successfully",
        data
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // ADMIN: PUBLISH BLOG
  // -----------------------------------------------------
  publish: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await BlogService.publishBlog(req.params.id);

      res.json({
        success: true,
        message: "Blog published successfully",
        data
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // USER: GET SINGLE BLOG BY SLUG
  // -----------------------------------------------------
  getOne: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await BlogService.getBlogBySlug(req.params.slug);

      res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // GET ALL BLOGS (FILTER + PAGINATION)
  // -----------------------------------------------------
  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await BlogService.getBlogs(req.query);

      res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // SEARCH BLOGS
  // -----------------------------------------------------
  search: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = req.query.q as string;

      const data = await BlogService.searchBlogs(query);

      res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // ADMIN: DELETE BLOG
  // -----------------------------------------------------
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await BlogService.deleteBlog(req.params.id);

      res.json({
        success: true,
        message: "Blog deleted successfully",
        data
      });
    } catch (err) {
      next(err);
    }
  }
};
