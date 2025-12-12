import { Blog } from "../blog/blog.model";
import { BlogLike } from "./blogLike.model";
import FilterQuery  from "mongoose";

interface TrendingResult {
  blog: any;
  score: number;
}

export class BlogTrendingService {
  private static CACHE_TTL_MS = 60 * 1000; // 1 minute cache
  private static cache: {
    timestamp: number;
    data: any[];
  } | null = null;

  // ============================
  // GET GENERAL TRENDING BLOGS
  // ============================
  static async getTrending(limit: number = 20) {
    // ---- Return cached result if still fresh ----
    if (
      this.cache &&
      Date.now() - this.cache.timestamp < this.CACHE_TTL_MS
    ) {
      return this.cache.data;
    }

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 3600 * 1000);

    // Get all likes for last 7 days
    const recentLikes = await BlogLike.find({
      createdAt: { $gte: sevenDaysAgo }
    }).lean();

    // Group likes per blog
    const likeMap: Record<string, number> = {};
    recentLikes.forEach((l) => {
      const id = l.blogId.toString();
      likeMap[id] = (likeMap[id] || 0) + 1;
    });

    // Load all published blogs
    const blogs = await Blog.find({ status: "published" }).lean();

    // Compute trending score
    const results: TrendingResult[] = blogs.map((blog) => {
      const likeScore = likeMap[blog._id.toString()] || 0;
      const viewScore = (blog.views || 0) * 0.2;

      // Recent blogs get bonus
      const ageMs = Date.now() - new Date(blog.createdAt).getTime();
      const recencyBoost = Math.max(0, 10 - ageMs / (24 * 3600 * 1000));

      const score = likeScore * 2 + viewScore + recencyBoost;

      return { blog, score };
    });

    // Sort and limit
    const sorted = results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((r) => r.blog);

    // Cache the result
    this.cache = {
      timestamp: Date.now(),
      data: sorted,
    };

    return sorted;
  }

  // ============================
  // GET CATEGORY TRENDING BLOGS
  // ============================
  static async getTrendingByCategory(category: string, limit: number = 20) {
    if (!category) return [];

    const blogs = await this.getTrending(200); // get a larger pool
    return blogs.filter((b) => b.category === category).slice(0, limit);
  }
}
