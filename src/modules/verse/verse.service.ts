// src/modules/verse/verse.service.ts
import AppError from "../../core/AppError";
import { VerseOfDay } from "./verseOFDay.model";
import axios from "axios";

const todayKey = () =>
  new Date().toISOString().split("T")[0];





/* =====================================================
   HELPERS
===================================================== */
const BIBLE_API = "https://bible-api.com";

const fetchRandomVerse = async () => {
  const res = await axios.get(`${BIBLE_API}/?random=verse`);

  if (!res.data?.reference) {
    throw new AppError("Failed to fetch verse", 500);
  }

  const reference = res.data.reference; // "John 3:16"
  const book = res.data.reference.split(" ")[0];
  const chapter = parseInt(res.data.reference.split(" ")[1].split(":")[0]);
  const verse = parseInt(res.data.reference.split(":")[1]);

  return {
    reference,
    book,
    chapter,
    verse,
    text: res.data.text,
    translation: res.data.translation_id || "WEB"
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