import axios from "axios";
import { Book } from "./book.model";
import { BookChapter } from "./bookChapter.model";

// Curated list of Christian/classic books from Gutenberg
const GUTENBERG_BOOKS = [
  { id: 10, title: "The King James Bible", author: "Various", category: "Scripture", audience: "adults" as const },
  { id: 131, title: "The Pilgrim's Progress", author: "John Bunyan", category: "Christian Classic", audience: "adults" as const },
  { id: 3296, title: "The Confessions of Saint Augustine", author: "Augustine", category: "Theology", audience: "adults" as const },
  { id: 1232, title: "The Prince", author: "Machiavelli", category: "Philosophy", audience: "adults" as const },
  { id: 4280, title: "The Imitation of Christ", author: "Thomas à Kempis", category: "Devotional", audience: "adults" as const },
  { id: 2165, title: "Foxe's Book of Martyrs", author: "John Foxe", category: "Church History", audience: "adults" as const },
  { id: 9798, title: "Spurgeon's Morning and Evening", author: "Charles Spurgeon", category: "Devotional", audience: "adults" as const },
  { id: 1934, title: "The Practice of the Presence of God", author: "Brother Lawrence", category: "Devotional", audience: "adults" as const },
  { id: 18584, title: "Mere Christianity", author: "C.S. Lewis", category: "Apologetics", audience: "teens" as const },
  { id: 15399, title: "The Bible Story for Children", author: "Various", category: "Bible Stories", audience: "kids" as const },
];

/* =====================================================
   FETCH BOOK TEXT FROM GUTENBERG
===================================================== */
const fetchBookText = async (gutenbergId: number): Promise<string> => {
  const urls = [
    `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt`,
    `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}-0.txt`,
    `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}.txt`,
  ];

  for (const url of urls) {
    try {
      const response = await axios.get(url, {
        timeout: 30000,
        responseType: "text"
      });
      if (response.data && response.data.length > 1000) {
        return response.data;
      }
    } catch {
      continue;
    }
  }

  throw new Error(`Could not fetch text for book ${gutenbergId}`);
};

/* =====================================================
   SPLIT TEXT INTO CHAPTERS
===================================================== */
const splitIntoChapters = (text: string): { title: string; content: string }[] => {
  // Remove Gutenberg header/footer
  const startMarkers = [
    "*** START OF THE PROJECT GUTENBERG",
    "***START OF THE PROJECT GUTENBERG",
    "*** START OF THIS PROJECT GUTENBERG",
  ];
  const endMarkers = [
    "*** END OF THE PROJECT GUTENBERG",
    "***END OF THE PROJECT GUTENBERG",
    "*** END OF THIS PROJECT GUTENBERG",
  ];

  let cleanText = text;

  for (const marker of startMarkers) {
    const idx = text.indexOf(marker);
    if (idx !== -1) {
      const afterMarker = text.indexOf("\n", idx);
      cleanText = text.substring(afterMarker + 1);
      break;
    }
  }

  for (const marker of endMarkers) {
    const idx = cleanText.indexOf(marker);
    if (idx !== -1) {
      cleanText = cleanText.substring(0, idx);
      break;
    }
  }

  // Try to split by chapter headings
  const chapterRegex = /\n\s*(CHAPTER\s+[IVXLCDM\d]+|Chapter\s+\d+|BOOK\s+[IVXLCDM\d]+|PSALM\s+\d+|Psalm\s+\d+)\s*\n/gi;
  const parts = cleanText.split(chapterRegex);

  if (parts.length > 2) {
    const chapters: { title: string; content: string }[] = [];

    for (let i = 1; i < parts.length; i += 2) {
      const title = parts[i]?.trim() || `Chapter ${Math.ceil(i / 2)}`;
      const content = parts[i + 1]?.trim() || "";

      if (content.length > 100) {
        chapters.push({ title, content });
      }
    }

    if (chapters.length > 0) return chapters;
  }

  // Fallback — split into chunks of ~3000 words
  const words = cleanText.split(/\s+/);
  const chunkSize = 3000;
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
===================================================== */
export const seedGutenbergBooks = async () => {
  try {
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
        coverImage: `https://www.gutenberg.org/cache/epub/${bookData.id}/pg${bookData.id}.cover.medium.jpg`,
        description: `A classic work by ${bookData.author}, available through Project Gutenberg.`
      });

      console.log(`📚 Registered: ${bookData.title}`);
    }

    console.log("✅ Gutenberg book metadata seeded");
  } catch (error) {
    console.error("❌ Gutenberg seeding failed:", error);
  }
};

/* =====================================================
   FETCH AND CACHE CHAPTERS FOR A BOOK (LAZY LOAD)
===================================================== */
export const fetchAndCacheChapters = async (book: any): Promise<void> => {
  if (book.isFetched) return; // Already cached

  console.log(`⬇️ Fetching chapters for: ${book.title}`);

  try {
    const text = await fetchBookText(book.gutenbergId);
    const chapters = splitIntoChapters(text);

    if (chapters.length === 0) {
      throw new Error("No chapters extracted");
    }

    // Save chapters to DB
    const chapterDocs = chapters.map((ch, index) => ({
      bookId: book._id,
      chapterNumber: index + 1,
      title: ch.title,
      content: ch.content
    }));

    // Use ordered: false to skip duplicates if any
    await BookChapter.insertMany(chapterDocs, { ordered: false }).catch(() => {});

    // Mark book as fetched
    await Book.findByIdAndUpdate(book._id, {
      isFetched: true,
      totalChapters: chapters.length
    });

    console.log(`✅ Cached ${chapters.length} chapters for: ${book.title}`);
  } catch (error) {
    console.error(`❌ Failed to fetch chapters for ${book.title}:`, error);
  }
};