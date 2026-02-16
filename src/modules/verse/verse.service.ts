// src/modules/verse/verse.service.ts
import AppError from "../../core/AppError";
import { VerseOfDay } from "./verseOFDay.model";
import axios from "axios";

const todayKey = () =>
  new Date().toISOString().split("T")[0];

const BIBLE_API = "https://bible-api.com";

const BIBLE_API_KEY = process.env.BIBLE_API_KEY;
const BIBLE_ID = process.env.BIBLE_ID || "de4e12af7f28f599-01"; // default KJV

if (!BIBLE_API_KEY) {
  throw new Error("BIBLE_API_KEY is not defined in environment variables");
}

/* =====================================================
   HELPERS
===================================================== */
const fetchRandomVerse = async () => {
  try {
    const response = await bibleClient.get(
      `/bibles/${BIBLE_ID}/verses/random`
    );

    const data = response.data?.data;

    if (!data?.reference || !data?.content) {
      throw new Error("Invalid API response");
    }

    const reference = data.reference;
    const [bookPart, chapterVerse] = reference.split(" ");
    const [chapter, verse] = chapterVerse.split(":");

    return {
      reference,
      book: bookPart,
      chapter: Number(chapter),
      verse: Number(verse),
      text: data.content.replace(/<[^>]*>/g, ""),
      translation: data.bibleId
    };

  } catch (error) {
    console.warn("⚠ API failed — using fallback verse");

    // 🔁 Fallback verse
    return {
      reference: "John 3:16",
      book: "John",
      chapter: 3,
      verse: 16,
      text: "For God so loved the world that he gave his only begotten Son so that whoever exercises faith in him might not be destroyed but have everlasting life",
      translation: "KJV"
    };
  }
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
      { upsert: true, new: true }
    ).lean();
  }
};