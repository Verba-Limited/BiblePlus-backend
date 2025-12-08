import { QuizAttempt } from "./quizAttempt.model";

export const LeaderboardService = {
  getTop: async () => {
    return await QuizAttempt.find({})
      .sort({ score: -1 })
      .limit(20)
      .select("userId score correctAnswers totalQuestions createdAt");
  }
};
