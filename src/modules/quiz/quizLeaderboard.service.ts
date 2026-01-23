import { QuizLeaderboard } from "./quizLeaderboard.model";

export const QuizLeaderboardService = {
  async update(userId: string, score: number, correct: number) {
    return await QuizLeaderboard.findOneAndUpdate(
      { userId },
      {
        $inc: {
          totalScore: score,
          totalCorrect: correct,
          totalPlayed: 1
        }
      },
      { upsert: true, new: true }
    );
  },

  async top(limit = 20) {
    return await QuizLeaderboard.find()
      .sort({ totalScore: -1 })
      .limit(limit)
      .select("-__v");
  }
};