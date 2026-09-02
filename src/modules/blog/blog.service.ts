import { Blog } from "./blog.model";
import AppError from "../../core/AppError";
import { NotificationService } from "../notifications/notification.service";
import { EmailService } from "../../services/email.service";
import { HydratedDocument } from "mongoose";
import { IBlog } from "./blog.model";
import { fetchAndCacheBlogContent } from "./christainBlog.service";
import { sanitizeUpdate, escapeRegex } from "../../utils/sanitize";

/* =========================================================
   EDITABLE FIELDS

   The editor loads a blog, the author corrects a couple of
   fields and PUTs the whole record back — `_id`, `slug`,
   `views`, `createdAt` and all. Mongo refuses any update
   that touches an immutable path, so the save failed and
   the correction looked like it had been rejected.

   Only these fields are writable from the editor; everything
   else the server owns.
========================================================= */
const BLOG_EDITABLE_FIELDS = [
  "title",
  "content",
  "summary",
  "excerpt",
  "coverImage",
  "category",
  "tags",
  "featured",
  "status"
];

const BLOG_PROTECTED_FIELDS = [
  "slug",
  "views",
  "source",
  "externalId",
  "externalUrl",
  "isFetched",
  "authorId",
  "author",
  "readingTime"
];

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

    const blogs = (await Blog.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .select("-content")) as unknown as HydratedDocument<IBlog>[];

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
  // ADMIN: GET BLOGS (drafts included)
  //
  // The public list hard-codes status "published", so drafts
  // and pending posts had no endpoint that could return them.
  // -----------------------------------------------------
  getBlogsForAdmin: async ({ page = 1, limit = 20, category, status, search }: any) => {
    const query: any = {};

    if (status && status !== "all") query.status = status;
    if (category) query.category = category;

    const term = (search || "").trim();
    if (term) {
      const safe = escapeRegex(term);
      query.$or = [
        { title: { $regex: safe, $options: "i" } },
        { summary: { $regex: safe, $options: "i" } },
        { category: { $regex: safe, $options: "i" } }
      ];
    }

    const pageNum = Math.max(Number(page) || 1, 1);
    const perPage = Math.min(Math.max(Number(limit) || 20, 1), 100);

    const [blogs, total, published, drafts] = await Promise.all([
      Blog.find(query)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * perPage)
        .limit(perPage)
        .select("-content"),
      Blog.countDocuments(query),
      Blog.countDocuments({ status: "published" }),
      Blog.countDocuments({ status: "draft" })
    ]);

    const pages = Math.ceil(total / perPage) || 1;

    return {
      blogs,
      counts: { all: published + drafts, published, drafts },
      pagination: {
        total,
        count: blogs.length,
        page: pageNum,
        limit: perPage,
        pages,
        hasNextPage: pageNum < pages,
        hasPrevPage: pageNum > 1
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
      { returnDocument: "after" }
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
    const term = (q || "").trim();
    const query: any = { status: "published" };

    // A blank term used to reach Mongo as `$regex: undefined` and throw
    if (term) {
      const safe = escapeRegex(term);
      query.$or = [
        { title: { $regex: safe, $options: "i" } },
        { summary: { $regex: safe, $options: "i" } },
        { category: { $regex: safe, $options: "i" } },
        { tags: { $regex: safe, $options: "i" } }
      ];
    }

    return await Blog.find(query)
      .sort({ createdAt: -1 })
      .select("-content"); // ✅ fast — no content in search results
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
    const blog = await Blog.findById(id) as HydratedDocument<IBlog> | null;
    if (!blog) throw new AppError("Blog not found", 404);

    const payload = sanitizeUpdate(data, BLOG_PROTECTED_FIELDS);

    // Apply the edit field by field through the document, so the
    // pre-save hook re-derives slug, reading time and excerpt when
    // the title or content actually changed.
    for (const field of BLOG_EDITABLE_FIELDS) {
      if (payload[field] === undefined) continue;

      if (field === "tags") {
        // Multipart forms send tags as a comma-separated string
        blog.set(
          "tags",
          Array.isArray(payload.tags)
            ? payload.tags
            : String(payload.tags)
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
        );
        continue;
      }

      if (field === "featured") {
        blog.set("featured", payload.featured === true || payload.featured === "true");
        continue;
      }

      blog.set(field, payload[field]);
    }

    // Content changed — let the hook recompute the derived copy
    // instead of keeping the old summary/excerpt around.
    if (payload.content !== undefined && blog.isModified("content")) {
      if (payload.summary === undefined) blog.summary = "";
      if (payload.excerpt === undefined) blog.excerpt = "";
    }

    const updated = (await blog.save()) as HydratedDocument<IBlog>;

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
      { returnDocument: "after" }
    ) as HydratedDocument<IBlog> | null;

    if (!updated) throw new AppError("Blog not found", 404);

    NotificationService.create(
      "ALL",
      "New Blog Published",
      `"${updated.title}" is now live. Tap to read.`,
      "blog-publish",
      { blogId: updated._id.toString() }
    ).catch(() => {});

    setImmediate(() => {
      EmailService.sendNewBlogToAll(updated).catch(console.error);
    });

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