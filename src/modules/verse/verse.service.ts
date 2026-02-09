import AppError from "../../core/AppError";
import { Verse } from "./verse.model";
import { VerseOfDay } from "./verseOFDay.model";
import axios from "axios";

const todayKey = () =>
  new Date().toISOString().split("T")[0];

const BIBLE_API = "https://bible-api.com";

/* =====================================================
   TYPES
===================================================== */
interface FetchedVerse {
  book: string;
  chapter: number;
  startVerse: number;
  text: string;
  translation: string;
}

/* =====================================================
   HELPERS
===================================================== */
const fetchRandomVerse = async (): Promise<FetchedVerse> => {
  const res = await axios.get(`${BIBLE_API}/random`);

  if (!res.data?.text) {
    throw new AppError("Failed to fetch verse", 500);
  }

  return {
    book: res.data.book_name,
    chapter: res.data.chapter,
    startVerse: res.data.verse,
    text: res.data.text,
    translation: "WEB"
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

    // ✅ already exists → return
    const existing = await VerseOfDay.findOne({ date: today })
      .populate("verse")
      .lean();

    if (existing) return existing;

    // 🔁 fetch verse
    const fetched = await fetchRandomVerse();

    // ♻️ reuse verse if already exists
    let verse = await Verse.findOne({
      book: fetched.book,
      chapter: fetched.chapter,
      startVerse: fetched.startVerse,
      translation: fetched.translation
    });

    if (!verse) {
      verse = await Verse.create(fetched);
    }

    const vod = await VerseOfDay.create({
      date: today,
      verse: verse._id,
      source: "auto",
      locked: true
    });

    return VerseOfDay.findById(vod._id)
      .populate("verse")
      .lean();
  },

  /* =====================================================
     LIST VERSE HISTORY
  ===================================================== */
  async history(limit = 30) {
    return VerseOfDay.find()
      .sort({ date: -1 })
      .limit(limit)
      .populate("verse")
      .lean();
  },

  /* =====================================================
     ADMIN: SET VERSE FOR DATE (OVERRIDE)
  ===================================================== */
  async setForDate(date: string, verseId: string) {
    if (!date) {
      throw new AppError("Date is required", 400);
    }

    const verse = await Verse.findById(verseId);
    if (!verse) {
      throw new AppError("Verse not found", 404);
    }

    return VerseOfDay.findOneAndUpdate(
      { date },
      {
        verse: verseId,
        source: "admin",
        locked: true
      },
      { upsert: true, new: true }
    )
      .populate("verse")
      .lean();
  },

  /* =====================================================
     ADMIN: ADD VERSE MANUALLY
  ===================================================== */
  async addVerse(payload: {
    book: string;
    chapter: number;
    startVerse: number;
    endVerse?: number;
    text: string;
    translation?: string;
  }) {
    const exists = await Verse.findOne({
      book: payload.book,
      chapter: payload.chapter,
      startVerse: payload.startVerse,
      endVerse: payload.endVerse ?? null,
      translation: payload.translation ?? "NWT"
    });

    if (exists) return exists;

    return Verse.create(payload);
  }
};