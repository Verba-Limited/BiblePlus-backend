import { Blog } from "./blog.model";
import AppError from "../../core/AppError";
import { NotificationService } from "../notifications/notification.service";
import { HydratedDocument } from "mongoose";
import { IBlog } from "./blog.types";
import { fetchAndCacheBlogContent } from "./devto.service";

export const BlogService = {

  async getBlogById(id: string) {
    const blog = await Blog.findById(id) as HydratedDocument<IBlog> | null;
    if (!blog) throw new AppError("Blog not found", 404);

    // ✅ Lazy fetch full content if not yet cached
    if (blog.source === "devto" && !blog.isFetched) {
      await fetchAndCacheBlogContent(blog);
      return await Blog.findById(id) as HydratedDocument<IBlog>;
    }

    return blog;
  },

  // -----------------------------------------------------
  // GET BLOGS WITH PAGINATION + FILTERS
  // -----------------------------------------------------
  getBlogs: async ({ page = 1, limit = 10, category, featured }: any) => {
    const query: any = { status: "published" }; // ✅ only show published
    if (category) query.category = category;
    if (featured === "true") query.featured = true;

    const skip = (Number(page) - 1) * Number(limit);

    const blogs = await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-content") // ✅ don't send full content in list — fast
      as unknown as HydratedDocument<IBlog>[];

    const total = await Blog.countDocuments(query);

    return {
      blogs,
      pagination: {
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit))
      }
    };
  },

  // -----------------------------------------------------
  // GET SINGLE BLOG BY SLUG
  // -----------------------------------------------------
  getBlogBySlug: async (slug: string) => {
    const blog = await Blog.findOneAndUpdate(
      { slug },
      { $inc: { views: 1 } },
      { new: true }
    ) as HydratedDocument<IBlog> | null;

    if (!blog) throw new AppError("Blog not found", 404);

    // ✅ Lazy fetch full content
    if (blog.source === "devto" && !blog.isFetched) {
      await fetchAndCacheBlogContent(blog);
      return await Blog.findOne({ slug }) as HydratedDocument<IBlog>;
    }

    return blog;
  },

  // -----------------------------------------------------
  // SEARCH BLOGS
  // -----------------------------------------------------
  searchBlogs: async (q: string) => {
    return await Blog.find({
      title: { $regex: q, $options: "i" },
      status: "published"
    }).select("-content"); // ✅ fast — no content in search results
  },

  // -----------------------------------------------------
  // ADMIN: CREATE BLOG
  // -----------------------------------------------------
  createBlog: async (data: any) => {
    const blog = await Blog.create({
      ...data,
      source: "admin",
      isFetched: true // admin blogs don't need external fetch
    }) as unknown as HydratedDocument<IBlog>;

    if (!blog) throw new AppError("Failed to create blog", 500);

    NotificationService.create(
      "ALL",
      "New Blog Created",
      `A new blog titled "${blog.title}" has been added.`,
      "blog",
      { blogId: blog._id.toString() }
    ).catch(() => {});

    return blog;
  },

  // -----------------------------------------------------
  // UPDATE BLOG
  // -----------------------------------------------------
  updateBlog: async (id: string, data: any) => {
    const updated = await Blog.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    }) as HydratedDocument<IBlog> | null;

    if (!updated) throw new AppError("Blog not found", 404);

    NotificationService.create(
      "ALL",
      "Blog Updated",
      `The blog "${updated.title}" was updated.`,
      "blog-update",
      { blogId: updated._id.toString() }
    ).catch(() => {});

    return updated;
  },

  // -----------------------------------------------------
  // PUBLISH BLOG
  // -----------------------------------------------------
  publishBlog: async (id: string) => {
    const updated = await Blog.findByIdAndUpdate(
      id,
      { status: "published" },
      { new: true }
    ) as HydratedDocument<IBlog> | null;

    if (!updated) throw new AppError("Blog not found", 404);

    NotificationService.create(
      "ALL",
      "New Blog Published",
      `"${updated.title}" is now live. Tap to read.`,
      "blog-publish",
      { blogId: updated._id.toString() }
    ).catch(() => {});

    return updated;
  },

  // -----------------------------------------------------
  // DELETE BLOG
  // -----------------------------------------------------
  deleteBlog: async (id: string) => {
    const deleted = await Blog.findByIdAndDelete(id) as HydratedDocument<IBlog> | null;
    if (!deleted) throw new AppError("Blog not found", 404);

    NotificationService.create(
      "ALL",
      "Blog Removed",
      `The blog "${deleted.title}" has been deleted.`,
      "blog-delete",
      { blogId: deleted._id.toString() }
    ).catch(() => {});

    return deleted;
  },
};