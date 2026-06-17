import Parser from "rss-parser";
import { Blog } from "./blog.model";

const parser = new Parser({
  timeout: 15000,
  headers: {
    "User-Agent": "Mozilla/5.0 (compatible; BiblePlusBot/1.0)"
  }
});

/* =====================================================
   CHRISTIAN RSS SOURCES
===================================================== */
const CHRISTIAN_SOURCES = [
  {
    name: "Desiring God",
    url: "https://www.desiringgod.org/rss/articles.xml",
    category: "Theology",
    audience: "adults" as const
  },
  {
    name: "Got Questions",
    url: "https://www.gotquestions.org/rss.xml",
    category: "Bible Study",
    audience: "adults" as const
  },
  {
    name: "Crosswalk",
    url: "https://www.crosswalk.com/rss/all.xml",
    category: "Christian Living",
    audience: "adults" as const
  },
  {
    name: "Christianity Today",
    url: "https://www.christianitytoday.com/ct/rss.xml",
    category: "Faith",
    audience: "adults" as const
  },
  {
    name: "Bible Gateway Blog",
    url: "https://www.biblegateway.com/blog/feed/",
    category: "Bible Study",
    audience: "adults" as const
  },
  {
    name: "Ligonier Ministries",
    url: "https://www.ligonier.org/feed",
    category: "Theology",
    audience: "adults" as const
  },
  {
    name: "The Gospel Coalition",
    url: "https://www.thegospelcoalition.org/feed/",
    category: "Gospel",
    audience: "adults" as const
  },
  {
    name: "Open Bible",
    url: "https://www.openbible.info/blog/feed/",
    category: "Bible Study",
    audience: "adults" as const
  }
];

/* =====================================================
   GENERATE SLUG FROM TITLE
===================================================== */
const generateSlug = (title: string, id: string): string => {
  const base = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 80);
  return `${base}-${id}`;
};

/* =====================================================
   GENERATE UNIQUE EXTERNAL ID
===================================================== */
const generateExternalId = (source: string, link: string): string => {
  const hash = Buffer.from(`${source}-${link}`).toString("base64").substring(0, 20);
  return hash;
};

/* =====================================================
   SEED CHRISTIAN BLOGS FROM RSS
===================================================== */
export const seedChristianBlogs = async () => {
  try {
    console.log("📖 Fetching Christian blogs from RSS feeds...");

    let seeded = 0;
    let skipped = 0;

    for (const source of CHRISTIAN_SOURCES) {
      try {
        console.log(`📡 Fetching from ${source.name}...`);

        const feed = await parser.parseURL(source.url);
        const items = feed.items.slice(0, 10); // ✅ max 10 per source

        for (const item of items) {
          if (!item.title || !item.link) continue;

          const externalId = generateExternalId(source.name, item.link);

          // ✅ Skip if already exists
          const exists = await Blog.findOne({ externalId });
          if (exists) {
            skipped++;
            continue;
          }

          // ✅ Extract content
          const rawContent =
            item["content:encoded"] ||
            item.content ||
            item.summary ||
            item.contentSnippet ||
            "";

          // ✅ Strip HTML tags for plain text summary
          const plainText = rawContent
            .replace(/<[^>]*>/g, " ")
            .replace(/\s+/g, " ")
            .trim();

          const excerpt = plainText.substring(0, 200) + "...";
          const summary = plainText.substring(0, 300) + "...";

          // ✅ Extract cover image from content
          const imageMatch = rawContent.match(/<img[^>]+src="([^">]+)"/);
          const coverImage = item["media:content"]?.$ ?.url ||
            item.enclosure?.url ||
            imageMatch?.[1] ||
            "";

          const slug = generateSlug(item.title, externalId);

          try {
            await Blog.create({
              title: item.title.trim(),
              content: rawContent || plainText,
              excerpt,
              summary,
              coverImage,
              category: source.category,
              author: item.creator || item.author || source.name,
              authorId: "",
              status: "published",
              source: "devto", // ✅ reuse existing enum value
              externalId,
              externalUrl: item.link,
              isFetched: true, // ✅ content already included in RSS
              featured: false,
              tags: [source.category.toLowerCase(), "christian", "faith"],
              views: 0,
              slug
            });
            seeded++;
          } catch (err: any) {
            if (err.code === 11000) continue; // skip duplicates
            console.error(`❌ Failed to save: ${item.title}`, err.message);
          }
        }

        // ✅ Delay between sources to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (sourceError: any) {
        // Graceful per-source failure — log concisely, don't spam console
        const msg = sourceError?.message || "Unknown error";
        console.warn(`⚠️  RSS skip: ${source.name} — ${msg.substring(0, 80)}`);
        continue; // ✅ don't stop — try next source
      }
    }

    console.log(`✅ Christian blogs seeded — ${seeded} added, ${skipped} skipped`);
  } catch (error) {
    console.error("❌ Christian blog seeding failed:", error);
  }
};

/* =====================================================
   REFRESH — called on schedule or manually
===================================================== */
export const refreshChristianBlogs = async () => {
  try {
    console.log("🔄 Refreshing Christian blogs...");
    await seedChristianBlogs();
    console.log("✅ Blog refresh complete");
  } catch (error) {
    console.error("❌ Blog refresh failed:", error);
  }
};

/* =====================================================
   FETCH AND CACHE FULL CONTENT (kept for compatibility)
   RSS already includes full content so this is a no-op
===================================================== */
export const fetchAndCacheBlogContent = async (blog: any): Promise<void> => {
  // RSS feeds include full content — nothing to lazy fetch
  if (!blog.isFetched) {
    await Blog.findByIdAndUpdate(blog._id, { isFetched: true });
  }
};