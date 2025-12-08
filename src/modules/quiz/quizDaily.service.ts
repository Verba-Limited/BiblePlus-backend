import { QuizLoader } from "./quiz.loader";
import { QuizStreak } from "./quizStreak.model";
import { QuizAttempt } from "./quizAttempt.model";
import AppError from "../../core/AppError";

export const QuizDailyService = {
  // Generate 5 random questions for today's quiz
  getDailyQuiz: async () => {
    const shuffled = QuizLoader.questions.sort(() => Math.random() - 0.5);
    const questions = shuffled.slice(0, 5);

    return {
      date: new Date().toDateString(),
      timer: 30,
      questions
    };
  },

  // Complete daily quiz + update streak
  completeDailyQuiz: async (userId: string, answers: any[]) => {
    const today = new Date().toDateString();

    let streak = await QuizStreak.findOne({ userId });

    if (!streak) {
      streak = await QuizStreak.create({
        userId,
        lastCompleted: today,
        streak: 1
      });
    } else {
      const last = streak.lastCompleted;
      const lastDate = new Date(last);
      const diff = (new Date(today).getTime() - lastDate.getTime()) / (1000 * 3600 * 24);

      if (diff === 1) {
        streak.streak += 1;
      } else if (diff > 1) {
        streak.streak = 1; // reset
      }

      streak.lastCompleted = today;
      await streak.save();
    }

    return {
      message: "Daily quiz completed",
      streak: streak.streak
    };
  }
};
