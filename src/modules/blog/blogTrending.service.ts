import { Blog } from "./blog.model";
import { BlogLike } from "./blogLike.model";

let trendingCache: any = null;
let trendingCacheTime = 0;

// Cache duration: 5 minutes
const CACHE_DURATION = 5 * 60 * 1000;

export const BlogTrendingService = {
  getTrending: async (limit: number) => {
    const now = Date.now();

    // ============================
    // CACHED RESPONSE
    // ============================
    if (trendingCache && now - trendingCacheTime < CACHE_DURATION) {
      return trendingCache.slice(0, limit);
    }

    // Last 7 days filter
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    // Only recent published blogs
    const blogs = await Blog.find({
      status: "published",
      createdAt: { $gte: sevenDaysAgo }
    })
      .sort({ createdAt: -1 })
      .limit(200);

    const results = await Promise.all(
      blogs.map(async (blog) => {
        const blogId = blog._id;

        // Count likes in the last 7 days only
        const recentLikes = await BlogLike.countDocuments({
          blogId,
          createdAt: { $gte: sevenDaysAgo }
        });

        // Score = views + (likes × 2)
        const score = blog.views + recentLikes * 2;

        return {
          blog,
          score,
          likes: recentLikes
        };
      })
    );

    // Sort by score
    const sorted = results.sort((a, b) => b.score - a.score);

    // Cache result
    trendingCache = sorted.map((x) => x.blog);
    trendingCacheTime = now;

    return trendingCache.slice(0, limit);
  },

  getTrendingByCategory: async (category: string, limit: number) => {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const blogs = await Blog.find({
      status: "published",
      category,
      createdAt: { $gte: sevenDaysAgo }
    })
      .sort({ createdAt: -1 })
      .limit(200);

    const results = await Promise.all(
      blogs.map(async (blog) => {
        const blogId = blog._id;

        const recentLikes = await BlogLike.countDocuments({
          blogId,
          createdAt: { $gte: sevenDaysAgo }
        });

        const score = blog.views + recentLikes * 2;

        return { blog, score };
      })
    );

    return results
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((x) => x.blog);
  }
};
