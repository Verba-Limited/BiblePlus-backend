import axios from "axios";
import { Book } from "./book.model";
import { BookChapter } from "./bookChapter.model";

// ✅ 100% Christian/Bible books from Gutenberg
const GUTENBERG_BOOKS = [
  // ===== SCRIPTURE =====
  {
    id: 10,
    title: "The King James Bible",
    author: "Various Authors",
    category: "Scripture",
    audience: "adults" as const,
    description: "The complete King James Version of the Holy Bible, one of the most influential religious texts in history."
  },
  {
    id: 8438,
    title: "The Bible, King James Version - New Testament",
    author: "Various Authors",
    category: "Scripture",
    audience: "adults" as const,
    description: "The New Testament of the King James Bible, containing the Gospels, Acts, Epistles, and Revelation."
  },

  // ===== DEVOTIONAL =====
  {
    id: 1934,
    title: "The Practice of the Presence of God",
    author: "Brother Lawrence",
    category: "Devotional",
    audience: "adults" as const,
    description: "A classic devotional on practicing God's presence in everyday life."
  },
  {
    id: 4280,
    title: "The Imitation of Christ",
    author: "Thomas à Kempis",
    category: "Devotional",
    audience: "adults" as const,
    description: "One of the most widely read Christian devotional books, focused on spiritual growth and humility."
  },
  {
    id: 9798,
    title: "Morning and Evening",
    author: "Charles Spurgeon",
    category: "Devotional",
    audience: "adults" as const,
    description: "Daily devotional readings by the Prince of Preachers, Charles Haddon Spurgeon."
  },

  // ===== THEOLOGY =====
  {
    id: 3296,
    title: "The Confessions of Saint Augustine",
    author: "Saint Augustine",
    category: "Theology",
    audience: "adults" as const,
    description: "Augustine's autobiographical account of his spiritual journey and conversion to Christianity."
  },
  {
    id: 6895,
    title: "The City of God",
    author: "Saint Augustine",
    category: "Theology",
    audience: "adults" as const,
    description: "Augustine's masterwork on Christian philosophy and the nature of God's kingdom."
  },
  {
    id: 1999,
    title: "Calvin's Institutes of the Christian Religion",
    author: "John Calvin",
    category: "Theology",
    audience: "adults" as const,
    description: "The foundational systematic theology of Reformed Christianity."
  },

  // ===== CHRISTIAN CLASSIC =====
  {
    id: 131,
    title: "The Pilgrim's Progress",
    author: "John Bunyan",
    category: "Christian Classic",
    audience: "adults" as const,
    description: "The classic Christian allegory of a man's journey from the City of Destruction to the Celestial City."
  },
  {
    id: 12622,
    title: "The Holy War",
    author: "John Bunyan",
    category: "Christian Classic",
    audience: "adults" as const,
    description: "John Bunyan's allegory of the battle for the soul of Mansoul."
  },
  {
    id: 1542,
    title: "The Screwtape Letters",
    author: "C.S. Lewis",
    category: "Christian Classic",
    audience: "adults" as const,
    description: "C.S. Lewis's classic satirical novel about a senior demon instructing a junior demon on temptation."
  },

  // ===== CHURCH HISTORY =====
  {
    id: 2165,
    title: "Foxe's Book of Martyrs",
    author: "John Foxe",
    category: "Church History",
    audience: "adults" as const,
    description: "A historic account of Christian martyrs throughout the centuries."
  },
  {
    id: 13484,
    title: "The Ecclesiastical History of the English Nation",
    author: "Bede",
    category: "Church History",
    audience: "adults" as const,
    description: "The Venerable Bede's classic history of the Christian Church in England."
  },

  // ===== PRAYER =====
  {
    id: 6352,
    title: "The Power of Prayer",
    author: "R.A. Torrey",
    category: "Prayer",
    audience: "adults" as const,
    description: "A classic guide to understanding and practising effective prayer."
  },
  {
    id: 7826,
    title: "With Christ in the School of Prayer",
    author: "Andrew Murray",
    category: "Prayer",
    audience: "adults" as const,
    description: "Andrew Murray's timeless classic on the discipline and power of prayer."
  },

  // ===== GOSPEL & EVANGELISM =====
  {
    id: 2607,
    title: "The Gospel of John - Commentary",
    author: "Various",
    category: "Gospel",
    audience: "adults" as const,
    description: "Deep study and commentary on the Gospel of John."
  },

  // ===== KIDS =====
  {
    id: 6521,
    title: "Bible Stories for Children",
    author: "Jesse Lyman Hurlbut",
    category: "Bible Stories",
    audience: "kids" as const,
    description: "Classic Bible stories retold for young readers."
  },
  {
    id: 5765,
    title: "Line Upon Line - Bible Lessons for Children",
    author: "Mrs. O.F. Walton",
    category: "Bible Stories",
    audience: "kids" as const,
    description: "Simple Bible lessons written especially for children."
  },

  // ===== TEENS =====
  {
    id: 1155,
    title: "The Christian's Secret of a Happy Life",
    author: "Hannah Whitall Smith",
    category: "Christian Living",
    audience: "teens" as const,
    description: "A warm and practical guide to living a joyful Christian life."
  },
  {
    id: 25344,
    title: "Mere Christianity",
    author: "C.S. Lewis",
    category: "Apologetics",
    audience: "teens" as const,
    description: "C.S. Lewis's classic defence of the Christian faith for modern readers."
  },
];

/* =====================================================
   FETCH BOOK TEXT FROM GUTENBERG
   ✅ Tries multiple URL formats
===================================================== */
const fetchBookText = async (gutenbergId: number): Promise<string> => {
  const urls = [
    `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt`,
    `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}-0.txt`,
    `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}.txt`,
    `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}-images.html`,
  ];

  for (const url of urls) {
    try {
      const response = await axios.get(url, {
        timeout: 30000,
        responseType: "text",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; BiblePlusBot/1.0)"
        }
      });
      if (response.data && response.data.length > 1000) {
        console.log(`✅ Fetched from: ${url}`);
        return response.data;
      }
    } catch {
      continue;
    }
  }

  throw new Error(`Could not fetch text for book ${gutenbergId}`);
};

/* =====================================================
   CLEAN GUTENBERG TEXT
===================================================== */
const cleanGutenbergText = (text: string): string => {
  const startMarkers = [
    "*** START OF THE PROJECT GUTENBERG",
    "***START OF THE PROJECT GUTENBERG",
    "*** START OF THIS PROJECT GUTENBERG",
    "*END*THE SMALL PRINT",
  ];
  const endMarkers = [
    "*** END OF THE PROJECT GUTENBERG",
    "***END OF THE PROJECT GUTENBERG",
    "*** END OF THIS PROJECT GUTENBERG",
    "End of Project Gutenberg",
    "End of the Project Gutenberg",
  ];

  let cleanText = text;

  // ✅ Remove header
  for (const marker of startMarkers) {
    const idx = text.indexOf(marker);
    if (idx !== -1) {
      const afterMarker = text.indexOf("\n", idx);
      cleanText = text.substring(afterMarker + 1);
      break;
    }
  }

  // ✅ Remove footer
  for (const marker of endMarkers) {
    const idx = cleanText.indexOf(marker);
    if (idx !== -1) {
      cleanText = cleanText.substring(0, idx);
      break;
    }
  }

  return cleanText.trim();
};

/* =====================================================
   SPLIT TEXT INTO CHAPTERS
===================================================== */
const splitIntoChapters = (text: string): { title: string; content: string }[] => {
  const cleanText = cleanGutenbergText(text);

  // ✅ Try multiple chapter heading patterns
  const chapterPatterns = [
    /\n\s*(CHAPTER\s+[IVXLCDM\d]+[^\n]*)\n/gi,
    /\n\s*(Chapter\s+\d+[^\n]*)\n/gi,
    /\n\s*(BOOK\s+[IVXLCDM\d]+[^\n]*)\n/gi,
    /\n\s*(PSALM\s+\d+[^\n]*)\n/gi,
    /\n\s*(Psalm\s+\d+[^\n]*)\n/gi,
    /\n\s*(SECTION\s+[IVXLCDM\d]+[^\n]*)\n/gi,
    /\n\s*(PART\s+[IVXLCDM\d]+[^\n]*)\n/gi,
    /\n\s*([IVX]+\.\s+[A-Z][^\n]{3,50})\n/g, // Roman numeral headings
  ];

  for (const pattern of chapterPatterns) {
    const parts = cleanText.split(pattern);

    if (parts.length > 2) {
      const chapters: { title: string; content: string }[] = [];

      for (let i = 1; i < parts.length; i += 2) {
        const title = parts[i]?.trim() || `Chapter ${Math.ceil(i / 2)}`;
        const content = parts[i + 1]?.trim() || "";

        if (content.length > 100) {
          chapters.push({ title, content });
        }
      }

      if (chapters.length >= 2) {
        console.log(`✅ Split into ${chapters.length} chapters using pattern`);
        return chapters;
      }
    }
  }

  // ✅ Fallback — split into readable chunks of ~2000 words
  console.log(`⚠️ No chapter headings found — splitting into chunks`);
  const words = cleanText.split(/\s+/);
  const chunkSize = 2000;
  const chunks: { title: string; content: string }[] = [];

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(" ");
    if (chunk.trim().length > 100) {
      chunks.push({
        title: `Part ${chunks.length + 1}`,
        content: chunk.trim()
      });
    }
  }

  return chunks;
};

/* =====================================================
   SEED GUTENBERG BOOKS INTO DB (metadata only)
   ✅ Fast — no content download on startup
===================================================== */
export const seedGutenbergBooks = async () => {
  try {
    console.log("📚 Seeding Gutenberg book metadata...");

    for (const bookData of GUTENBERG_BOOKS) {
      const exists = await Book.findOne({ gutenbergId: bookData.id });
      if (exists) continue;

      await Book.create({
        title: bookData.title,
        author: bookData.author,
        category: bookData.category,
        audience: bookData.audience,
        gutenbergId: bookData.id,
        source: "gutenberg",
        isFetched: false,
        totalChapters: 0,
        coverImage: `https://www.gutenberg.org/cache/epub/${bookData.id}/pg${bookData.id}.cover.medium.jpg`,
        description: bookData.description
      });

      console.log(`📖 Registered: ${bookData.title}`);
    }

    console.log("✅ Gutenberg book metadata seeded");
  } catch (error) {
    console.error("❌ Gutenberg seeding failed:", error);
  }
};

/* =====================================================
   FETCH AND CACHE CHAPTERS FOR A BOOK (LAZY LOAD)
   ✅ Only runs once per book — first time user opens it
===================================================== */
export const fetchAndCacheChapters = async (book: any): Promise<void> => {
  if (book.isFetched) return;

  console.log(`⬇️ Fetching chapters for: ${book.title}`);

  try {
    const text = await fetchBookText(book.gutenbergId);
    const chapters = splitIntoChapters(text);

    if (chapters.length === 0) {
      // ✅ Mark as fetched even if empty so we don't keep retrying
      await Book.findByIdAndUpdate(book._id, { isFetched: true, totalChapters: 0 });
      throw new Error("No chapters extracted");
    }

    // ✅ Save chapters in batches to avoid memory issues
    const BATCH_SIZE = 20;
    for (let i = 0; i < chapters.length; i += BATCH_SIZE) {
      const batch = chapters.slice(i, i + BATCH_SIZE).map((ch, idx) => ({
        bookId: book._id,
        chapterNumber: i + idx + 1,
        title: ch.title,
        content: ch.content
      }));

      await BookChapter.insertMany(batch, { ordered: false }).catch(() => {});
    }

    // ✅ Mark book as fully fetched
    await Book.findByIdAndUpdate(book._id, {
      isFetched: true,
      totalChapters: chapters.length
    });

    console.log(`✅ Cached ${chapters.length} chapters for: ${book.title}`);
  } catch (error) {
    console.error(`❌ Failed to fetch chapters for ${book.title}:`, error);
    // ✅ Mark as fetched to prevent infinite retry loops
    await Book.findByIdAndUpdate(book._id, { isFetched: true }).catch(() => {});
  }
};