// src/modules/verse/verse.service.ts
import AppError from "../../core/AppError";
import { VerseOfDay } from "./verseOFDay.model";
import { Verse } from "./verse.model";
import axios from "axios";

const todayKey = () =>
  new Date().toISOString().split("T")[0];





/* =====================================================
   HELPERS
===================================================== */
const BIBLE_API = "https://bible-api.com";

/**
 * Parse "1 John 3:16" / "John 3:16-17" into its parts.
 * The book name can carry a leading number, so split on the LAST space.
 */
const parseReference = (reference: string) => {
  const trimmed = String(reference || "").trim();
  const lastSpace = trimmed.lastIndexOf(" ");

  const book = lastSpace === -1 ? trimmed : trimmed.slice(0, lastSpace);
  const locator = lastSpace === -1 ? "" : trimmed.slice(lastSpace + 1);

  const [chapterPart, versePart] = locator.split(":");

  return {
    book: book || "Unknown",
    chapter: parseInt(chapterPart, 10) || 1,
    // "16-17" -> 16
    verse: parseInt((versePart || "").split("-")[0], 10) || 1
  };
};

const fetchRandomVerse = async () => {
  const res = await axios.get(`${BIBLE_API}/?random=verse`, { timeout: 8000 });

  if (!res.data?.reference) {
    throw new AppError("Failed to fetch verse", 502);
  }

  const reference = res.data.reference;
  const { book, chapter, verse } = parseReference(reference);

  return {
    reference,
    book,
    chapter,
    verse,
    text: String(res.data.text || "").trim(),
    translation: res.data.translation_id || "WEB"
  };
};

/**
 * A random verse drawn from the Bible text already in our own
 * database — no external call, so it works offline.
 */
const localRandomVerse = async () => {
  const [pick] = await Verse.aggregate([{ $sample: { size: 1 } }]);
  if (!pick) return null;

  const verseNo = pick.startVerse;
  const range =
    pick.endVerse && pick.endVerse !== verseNo
      ? `${verseNo}-${pick.endVerse}`
      : `${verseNo}`;

  return {
    reference: `${pick.book} ${pick.chapter}:${range}`,
    book: pick.book,
    chapter: pick.chapter,
    verse: verseNo,
    text: String(pick.text || "").trim(),
    translation: pick.translation || "WEB"
  };
};

/* =====================================================
   VERSE SERVICE
===================================================== */
export const VerseService = {
  /* =====================================================
     GET VERSE OF THE DAY (AUTO + LOCK)
  ===================================================== */
  async getToday() {
    const today = todayKey();

    // ✅ Return cached verse
    const existing = await VerseOfDay.findOne({ date: today }).lean();
    if (existing) return existing;

    // 🔁 Auto-fetch verse
    const fetched = await fetchRandomVerse();

    // ✅ Save embedded verse
    return VerseOfDay.create({
      date: today,
      ...fetched,
      source: "auto",
      locked: true
    });
  },

  /* =====================================================
     SAMPLE VERSE (ADMIN "LOAD SAMPLE")

     Returns a candidate verse for the editor to preview and
     save. Tries our own Bible collection first so the button
     keeps working when bible-api.com is slow or unreachable —
     the previous code had no path here at all.
  ===================================================== */
  async getSample() {
    // 1. Our own Bible text — no network needed
    try {
      const local = await localRandomVerse();
      if (local?.text) return { ...local, origin: "library" as const };
    } catch (err) {
      console.error("⚠️  Local sample verse lookup failed:", (err as Error).message);
    }

    // 2. External API
    try {
      const remote = await fetchRandomVerse();
      if (remote?.text) return { ...remote, origin: "bible-api" as const };
    } catch (err) {
      console.error("⚠️  Remote sample verse lookup failed:", (err as Error).message);
    }

    // 3. Never leave the editor with nothing to preview
    return {
      reference: "John 3:16",
      book: "John",
      chapter: 3,
      verse: 16,
      text:
        "For God so loved the world, that he gave his one and only Son, " +
        "that whoever believes in him should not perish, but have eternal life.",
      translation: "WEB",
      origin: "fallback" as const
    };
  },

  /* =====================================================
     PREVIEW A SPECIFIC DATE
  ===================================================== */
  async getForDate(date: string) {
    if (!date) throw new AppError("Date is required", 400);
    return VerseOfDay.findOne({ date }).lean();
  },

  /* =====================================================
     LIST VERSE HISTORY
  ===================================================== */
  async history(limit = 30) {
    return VerseOfDay.find()
      .sort({ date: -1 })
      .limit(limit)
      .lean();
  },

  /* =====================================================
     ADMIN: SET VERSE FOR DATE (OVERRIDE)
  ===================================================== */
  async setForDate(
    date: string,
    payload: {
      reference: string;
      book: string;
      chapter: number;
      verse: number;
      text: string;
      translation?: string;
    }
  ) {
    if (!date) {
      throw new AppError("Date is required", 400);
    }

    return VerseOfDay.findOneAndUpdate(
      { date },
      {
        ...payload,
        source: "admin",
        locked: true
      },
      { upsert: true, returnDocument: "after" }
    ).lean();
  }
};