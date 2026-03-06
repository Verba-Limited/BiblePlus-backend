import { VerseOfDay } from "./verseOFDay.model";
import { VerseLike } from "./verseLike.model";
import { VerseComment } from "./verseComment.model";
import { VerseShare } from "./verseShare.model";

export const VerseTrendingService = {

  async getTrending(limit = 10) {

    const verses = await VerseOfDay.find().sort({ date: -1 }).limit(50).lean();

    const scored = [];

    for (const verse of verses) {

      const [likes, comments, shares] = await Promise.all([
        VerseLike.countDocuments({ verse: verse._id }),
        VerseComment.countDocuments({ verse: verse._id }),
        VerseShare.countDocuments({ verse: verse._id })
      ]);

      const score =
        (likes * 3) +
        (comments * 5) +
        (shares * 4);

      scored.push({
        verse,
        likes,
        comments,
        shares,
        score
      });

    }

    scored.sort((a, b) => b.score - a.score);

    return scored.slice(0, limit);
  }

};