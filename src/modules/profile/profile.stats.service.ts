import { QuizAttempt } from "../quiz/quizAttempt.model";
import { QuizStreak } from "../quiz/quizStreak.model";
import { Prayer } from "../prayer/prayer.model";
import { BlogBookmark } from "../blog/blogBookmark.model";
import { BookFavorite } from "../books/bookFavorite.model";

export const ProfileStatsService = {
  getStats: async (userId: string) => {
    /* =======================
        QUIZ STATS (SCORABLE)
    ======================== */
    const quizAttempts = await QuizAttempt.find({ userId }).lean();

    const bestScore =
      quizAttempts.length > 0
        ? Math.max(...quizAttempts.map((q: any) => q.score))
        : 0;

    const totalAttempts = quizAttempts.length;

    /* =======================
        DAILY QUIZ STREAK
    ======================== */
    const streak = await QuizStreak.findOne({ userId });

    /* =======================
        PRAYER STATS
    ======================== */
    const prayersCreated = await Prayer.countDocuments({ userId });
    const prayersAnswered = await Prayer.countDocuments({
      userId,
      status: "answered",
    });

    /* =======================
        BOOKMARK STATS
    ======================== */
    const blogBookmarks = await BlogBookmark.countDocuments({ userId });
    const bookBookmarks = await BookFavorite.countDocuments({ userId });

    return {
      quizzes: {
        attempts: totalAttempts,
        bestScore,
        dailyStreak: streak?.streak || 0,
      },
      prayers: {
        created: prayersCreated,
        answered: prayersAnswered,
      },
      bookmarks: {
        blogs: blogBookmarks,
        books: bookBookmarks,
      },
    };
  },
};
