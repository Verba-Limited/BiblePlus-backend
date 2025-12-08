import AppError from "../../core/AppError";
import { QuizLoader } from "./quiz.loader";
import { QuizStreak } from "./quizStreak.model";

export const QuizService = {
  // ---------------------------------------------------------------------
  // 1. GET RANDOM QUESTIONS WITH FILTERS (category, difficulty, amount)
  // ---------------------------------------------------------------------
  getQuestions: (
    amount: number = 10,
    category: string = "",
    difficulty: string = ""
  ) => {
    let questions = QuizLoader.questions;

    // Filter by category (ot, nt, general)
    if (category) {
      questions = questions.filter(q => q.category === category);
    }

    // Filter by difficulty (easy, medium, hard)
    if (difficulty) {
      questions = questions.filter(q => q.difficulty === difficulty);
    }

    if (!questions.length) {
      throw new AppError("No questions available", 404);
    }

    // Fisher–Yates shuffle — BEST random shuffle
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    return questions.slice(0, amount);
  },

  // ---------------------------------------------------------------------
  // 2. GRADE QUIZ (scores + difficulty progression built in)
  // ---------------------------------------------------------------------
  gradeQuiz: (
    answers: { index: number; answer: number }[],
    difficulty: string = "easy"
  ) => {
    const total = answers.length;
    let correct = 0;

    answers.forEach((userAnswer) => {
      const question = QuizLoader.questions[userAnswer.index];

      if (!question) return;

      if (question.correctAnswer === userAnswer.answer) {
        correct++;
      }
    });

    const score = Math.round((correct / total) * 100);

    // ---------------------------------------------------------------------
    // DIFFICULTY PROGRESSION
    // ---------------------------------------------------------------------
    let newDifficulty = difficulty;

    if (score >= 90) newDifficulty = "hard";
    else if (score >= 80 && difficulty !== "hard") newDifficulty = "medium";
    else if (score < 50) newDifficulty = "easy";

    return {
      total,
      correct,
      score,
      previousDifficulty: difficulty,
      newDifficulty
    };
  },

  // ---------------------------------------------------------------------
  // 3. GET DAILY QUIZ STREAKS
  // ---------------------------------------------------------------------
  getUserStreak: async (userId: string) => {
    const record = await QuizStreak.findOne({ userId });

    if (!record) {
      return {
        streak: 0,
        lastCompleted: null
      };
    }

    return {
      streak: record.streak,
      lastCompleted: record.lastCompleted
    };
  }
};
