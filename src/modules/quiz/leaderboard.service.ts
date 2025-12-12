import { QuizAttempt } from "./quizAttempt.model";

export const LeaderboardService = {
  /* ===========================================================
     GET GLOBAL LEADERBOARD
     Supports:
       - limit (default 20)
       - category filter (optional)
  ============================================================ */
  getTop: async (limit: number = 20, category?: string) => {
    const query: any = {};

    if (category) {
      query.category = category;
    }

    const results = await QuizAttempt.find(query)
      .sort({
        score: -1,          // Highest score first
        correctAnswers: -1, // Tie-breaker #1
        createdAt: 1        // Older entries rank higher if tied
      })
      .limit(limit)
      .select("userId score correctAnswers totalQuestions category createdAt");

    return results;
  },
};
