// src/modules/verse/verse.service.ts
import AppError from "../../core/AppError";
import { VerseOfDay } from "./verseOFDay.model";
import axios from "axios";

const todayKey = () =>
  new Date().toISOString().split("T")[0];

const BIBLE_API = "https://bible-api.com";

/* =====================================================
   HELPERS
===================================================== */
const fetchRandomVerse = async () => {
  // Example random verse source
  const response = await axios.get(
    `${BIBLE_API}/data/web/random`
  );

  const verse = response.data?.random_verse;

  if (!verse) {
    throw new AppError("Failed to fetch verse", 500);
  }

  return {
    reference: verse.reference,
    book: verse.book,
    chapter: verse.chapter,
    verse: verse.verse,
    text: verse.text,
    translation: verse.translation_id || "WEB"
  };
};

/* =====================================================
   VERSE SERVICE
===================================================== */
export const VerseService = {
  /* =====================================================
     GET VERSE OF TODAY (AUTO CREATE + LOCK)
     GET /api/verse/today
  ===================================================== */
  async getToday() {
    const today = todayKey();

    let record = await VerseOfDay.findOne({ date: today }).lean();

    // ✅ Already exists → return cached verse
    if (record) return record;

    // 🔁 Auto-fetch verse
    const verse = await fetchRandomVerse();

    const created = await VerseOfDay.create({
      date: today,
      ...verse,
      source: "auto",
      locked: true
    });

    return created.toObject();
  },

  /* =====================================================
     LIST PAST VERSES
     GET /api/verse/history
  ===================================================== */
  async history(limit = 30) {
    return VerseOfDay.find()
      .sort({ date: -1 })
      .limit(limit)
      .lean();
  },

  /* =====================================================
     ADMIN: SET VERSE FOR A DATE (OVERRIDE)
     POST /api/admin/verse/set
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
      { upsert: true, new: true }
    ).lean();
  }
};