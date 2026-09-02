import { Request, Response, NextFunction } from "express";
import { BlogService } from "./blog.service";
import { refreshChristianBlogs } from "./christainBlog.service";
import { readSearchTerm } from "../../utils/sanitize";

export const BlogController = {

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
  // ADMIN: LIST BLOGS (?status=draft|published|all)
  // -----------------------------------------------------
  adminList: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await BlogService.getBlogsForAdmin({
        page: req.query.page,
        limit: req.query.limit,
        category: req.query.category,
        status: req.query.status,
        search: readSearchTerm(req.query as any)
      });

      res.json({
        success: true,
        count: result.blogs.length,
        total: result.pagination.total,
        counts: result.counts,
        pagination: result.pagination,
        data: result.blogs
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // GET SINGLE BLOG BY SLUG (USER)
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
  // GET SINGLE BLOG BY ID (ADMIN)
  // -----------------------------------------------------
  getOneById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await BlogService.getBlogById(req.params.id);

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
      // Accept ?q= , ?search= or ?query= — clients disagreed on the name
      const query = readSearchTerm(req.query as any);

      if (!query) {
        res.json({ success: true, count: 0, data: [] });
        return;
      }

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
  // ADMIN: CREATE BLOG
  // -----------------------------------------------------
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const authorId = req.userId;

      // ✅ Use Cloudinary URL if file uploaded
      // multer-storage-cloudinary puts the URL in req.file.path
      const coverImage = req.file?.path;

      if (req.file) {
        console.log("📸 Blog cover uploaded:", { path: req.file.path, filename: req.file.filename });
      } else {
        console.warn("⚠️ No file received for blog cover. Check form-data field name is 'coverImage'.");
      }

      const data = await BlogService.createBlog({
        ...req.body,
        authorId,
        ...(coverImage && { coverImage }),
        source: "admin",
      });

      res.status(201).json({
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
      // ✅ Use Cloudinary URL if new image uploaded
      // multer-storage-cloudinary puts the URL in req.file.path
      const coverImage = req.file?.path;

      if (req.file) {
        console.log("📸 Blog cover updated:", { path: req.file.path, filename: req.file.filename });
      }

      const data = await BlogService.updateBlog(req.params.id, {
        ...req.body,
        ...(coverImage && { coverImage })
      });

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
  // ADMIN: DELETE BLOG
  // -----------------------------------------------------
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await BlogService.deleteBlog(req.params.id);

      res.json({
        success: true,
        message: "Blog deleted successfully"
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // ADMIN: MANUALLY REFRESH DEV.TO BLOGS
  // POST /api/blog/admin/refresh
  // -----------------------------------------------------
  refreshExternal: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // ✅ Run in background — don't make admin wait
    refreshChristianBlogs().catch(console.error);

      res.json({
        success: true,
        message: "Blog refresh started in background"
      });
    } catch (err) {
      next(err);
    }
  }
};