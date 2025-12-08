import { Blog } from "./blog.model";
import { BlogLike } from "./blogLike.model";

export const BlogTrendingService = {
  getTrending: async () => {
    // Step 1: Get all blogs
    const blogs = await Blog.find({ status: "published" });

    // Step 2: Fetch likes for each blog
    const likesCount = await BlogLike.aggregate([
      { $group: { _id: "$blogId", likes: { $sum: 1 } } }
    ]);

    const likesMap = new Map(
      likesCount.map((item) => [item._id.toString(), item.likes])
    );

    // Step 3: Compute trending score
    const ranked = blogs
      .map((blog) => {
        const likes = likesMap.get(blog._id.toString()) || 0;
        const score = blog.views + likes * 3;

        return {
          blog,
          score
        };
      })
      .sort((a, b) => b.score - a.score) // highest score first
      .slice(0, 10); // top 10 trending

    return ranked;
  }
};
