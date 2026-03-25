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

const CHRISTIAN_KEYWORDS = [
  "christian", "faith", "bible", "god", "jesus", "christ",
  "prayer", "gospel", "church", "devotional", "theology",
  "scripture", "holy", "spirit", "salvation", "worship",
  "grace", "mercy", "blessing", "sermon", "ministry",
  "disciple", "resurrection", "cross", "baptism", "covenant",
  "repentance", "righteousness", "sanctification", "redemption"
];

const PROGRAMMING_KEYWORDS = [
  "javascript", "python", "code", "coding", "programming", "developer",
  "software", "api", "react", "node", "css", "html", "typescript",
  "backend", "frontend", "database", "framework", "tutorial", "github",
  "docker", "kubernetes", "aws", "cloud", "devops", "machine learning",
  "artificial intelligence", "web development", "open source", "linux",
  "angular", "vue", "nextjs", "graphql", "rest api", "microservices"
];

/* =====================================================
   CONTENT FILTER — reject non-Christian articles
===================================================== */
const isChristianContent = (article: any): boolean => {
  const titleLower = article.title.toLowerCase();
  const descLower = (article.description || "").toLowerCase();
  const tags = (article.tag_list || []).map((t: string) => t.toLowerCase());

  // ✅ Reject if it contains programming keywords
  const hasProgramming = PROGRAMMING_KEYWORDS.some(kw =>
    titleLower.includes(kw) ||
    descLower.includes(kw) ||
    tags.some((t: string) => t.includes(kw))
  );

  if (hasProgramming) return false;

  // ✅ Accept only if it has Christian keywords
  const hasChristian = CHRISTIAN_KEYWORDS.some(kw =>
    titleLower.includes(kw) ||
    descLower.includes(kw) ||
    tags.some((t: string) => t.includes(kw))
  );

  return hasChristian;
};

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

    let seeded = 0;
    let skipped = 0;

    for (const tag of CHRISTIAN_TAGS) {
      const articles = await fetchArticlesByTag(tag, 10); // ✅ fetch more so filter has more to work with

      for (const article of articles) {
        // ✅ Filter out non-Christian content
        if (!isChristianContent(article)) {
          console.log(`⏭️ Skipping: "${article.title}"`);
          skipped++;
          continue;
        }

        // ✅ Skip if already exists
        const exists = await Blog.findOne({ externalId: String(article.id) });
        if (exists) continue;

        const coverImage = article.cover_image || article.social_image || "";

        try {
          await Blog.create({
            title: article.title,
            content: article.description || "",
            excerpt: article.description || "",
            summary: article.description || "",
            coverImage,
            category: mapTagToCategory(tag),
            author: article.user?.name || "Dev.to Author",
            authorId: "",
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
          seeded++;
        } catch (err: any) {
          // ✅ Skip duplicate slug errors silently
          if (err.code === 11000) continue;
          console.error(`❌ Failed to save article: ${article.title}`, err);
        }
      }

      // ✅ Delay between tag requests to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    console.log(`✅ Dev.to blogs seeded — ${seeded} added, ${skipped} skipped`);
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

    if (!content) {
      // ✅ Mark as fetched even if empty so we don't keep retrying
      await Blog.findByIdAndUpdate(blog._id, { isFetched: true });
      return;
    }

    const words = content.split(/\s+/).length;
    const readingTime = Math.ceil(words / 200);

    await Blog.findByIdAndUpdate(blog._id, {
      content,
      isFetched: true,
      readingTime,
      // ✅ Update summary from full content if it was just the description before
      summary: content.substring(0, 200) + "..."
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
   REFRESH BLOGS — called on schedule or manually
===================================================== */
export const refreshDevtoBlogs = async () => {
  try {
    console.log("🔄 Refreshing Dev.to blogs...");
    await seedDevtoBlogs();
    console.log("✅ Blog refresh complete");
  } catch (error) {
    console.error("❌ Blog refresh failed:", error);
  }
};