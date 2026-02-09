// src/modules/verse/verse.service.ts
import AppError from "../../core/AppError";
import { Verse } from "./verse.model";
import { VerseOfDay } from "./verseOFDay.model";

const todayKey = () =>
  new Date().toISOString().split("T")[0];

export const VerseService = {
  /* =====================================================
     GET VERSE OF TODAY (AUTO CREATE)
  ===================================================== */
  async getToday() {
    const today = todayKey();

    let record = await VerseOfDay.findOne({ date: today })
      .populate("verse")
      .lean();

    if (!record) {
      const count = await Verse.countDocuments();
      if (!count) {
        throw new AppError("No verses available", 404);
      }

      const random = await Verse.aggregate([
        { $sample: { size: 1 } }
      ]);

      record = await VerseOfDay.create({
        date: today,
        verse: random[0]._id,
        source: "auto"
      });

      record = await VerseOfDay.findOne({ date: today })
        .populate("verse")
        .lean();
    }

    return record;
  },

  /* =====================================================
     LIST PAST VERSES
  ===================================================== */
  async history(limit = 30) {
    return VerseOfDay.find()
      .sort({ date: -1 })
      .limit(limit)
      .populate("verse")
      .lean();
  },

  /* =====================================================
     ADMIN: SET VERSE FOR DATE
  ===================================================== */
  async setForDate(date: string, verseId: string) {
    const verse = await Verse.findById(verseId);
    if (!verse) {
      throw new AppError("Verse not found", 404);
    }

    return VerseOfDay.findOneAndUpdate(
      { date },
      {
        verse: verseId,
        source: "admin"
      },
      { upsert: true, new: true }
    );
  },

  /* =====================================================
     ADMIN: ADD VERSE
  ===================================================== */
  async addVerse(payload: any) {
    return Verse.create(payload);
  }
};