import axios from "axios";
import { Blog } from "./blog.model";

const DEVTO_API = "https://dev.to/api";

const CHRISTIAN_TAGS = [
  "christian",
  "faith",
  "bible",
  "christianity",
  "prayer",
  "gospel",
  "jesus",
  "devotional",
  "theology"
];

/* =====================================================
   FETCH ARTICLES FROM DEV.TO BY TAG
===================================================== */
const fetchArticlesByTag = async (tag: string, perPage = 10) => {
  try {
    const response = await axios.get(`${DEVTO_API}/articles`, {
      params: {
        tag,
        per_page: perPage,
        state: "rising"
      },
      timeout: 10000
    });
    return response.data || [];
  } catch (error) {
    console.error(`❌ Failed to fetch articles for tag: ${tag}`, error);
    return [];
  }
};

/* =====================================================
   FETCH FULL ARTICLE CONTENT
===================================================== */
const fetchArticleContent = async (articleId: number): Promise<string> => {
  try {
    const response = await axios.get(`${DEVTO_API}/articles/${articleId}`, {
      timeout: 10000
    });
    return response.data?.body_markdown || response.data?.body_html || "";
  } catch {
    return "";
  }
};

/* =====================================================
   SEED DEVTO BLOGS INTO DB
===================================================== */
export const seedDevtoBlogs = async () => {
  try {
    console.log("📰 Fetching Christian blogs from Dev.to...");

    for (const tag of CHRISTIAN_TAGS) {
      const articles = await fetchArticlesByTag(tag, 5);

      for (const article of articles) {
        // Skip if already exists
        const exists = await Blog.findOne({ externalId: String(article.id) });
        if (exists) continue;

        // Skip articles with no cover image
        const coverImage = article.cover_image || article.social_image || "";

        await Blog.create({
          title: article.title,
          content: article.description || "",
          excerpt: article.description || "",
          coverImage,
          category: mapTagToCategory(tag),
          author: article.user?.name || "Dev.to Author",
          status: "published",
          source: "devto",
          externalId: String(article.id),
          externalUrl: article.url,
          isFetched: false,
          featured: false,
          tags: article.tag_list || [],
          views: article.page_views_count || 0,
          slug: `devto-${article.id}-${article.slug}`
        });
      }

      // ✅ Small delay between tag requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log("✅ Dev.to blogs seeded");
  } catch (error) {
    console.error("❌ Dev.to seeding failed:", error);
  }
};

/* =====================================================
   LAZY FETCH FULL CONTENT FOR A BLOG
===================================================== */
export const fetchAndCacheBlogContent = async (blog: any): Promise<void> => {
  if (blog.isFetched || blog.source !== "devto") return;

  try {
    console.log(`⬇️ Fetching full content for: ${blog.title}`);

    const content = await fetchArticleContent(Number(blog.externalId));

    await Blog.findByIdAndUpdate(blog._id, {
      content: content || blog.content,
      isFetched: true
    });

    console.log(`✅ Cached full content for: ${blog.title}`);
  } catch (error) {
    console.error(`❌ Failed to fetch content for ${blog.title}:`, error);
  }
};

/* =====================================================
   MAP TAG TO CATEGORY
===================================================== */
const mapTagToCategory = (tag: string): string => {
  const map: Record<string, string> = {
    christian: "Christian Living",
    faith: "Faith",
    bible: "Bible Study",
    christianity: "Christian Living",
    prayer: "Prayer",
    gospel: "Gospel",
    jesus: "Faith",
    devotional: "Devotional",
    theology: "Theology"
  };
  return map[tag] || "General";
};

/* =====================================================
   REFRESH BLOGS — call this on a schedule
===================================================== */
export const refreshDevtoBlogs = async () => {
  try {
    console.log("🔄 Refreshing Dev.to blogs...");
    await seedDevtoBlogs();
  } catch (error) {
    console.error("❌ Blog refresh failed:", error);
  }
};