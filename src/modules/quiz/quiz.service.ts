import AppError from "../../core/AppError";
import { QuizLoader } from "./quiz.loader";
import { QuizStreak } from "./quizStreak.model";

export interface UserAnswer {
  index: number;
  answer: number;
}

export const QuizService = {

  // ---------------------------------------------------------------------
  // 1. GET RANDOM QUESTIONS WITH FILTERS
  // ---------------------------------------------------------------------
  getQuestions: (
    amount: number = 10,
    category: string = "",
    difficulty: string = ""
  ) => {
    // NEVER modify original pool — clone it
    let questions = [...QuizLoader.questions];

    // Filter by category
    if (category.trim() !== "") {
      questions = questions.filter(q => q.category === category);
    }

    // Filter by difficulty
    if (difficulty.trim() !== "") {
      questions = questions.filter(q => q.difficulty === difficulty);
    }

    if (questions.length === 0) {
      throw new AppError("No questions available for this filter", 404);
    }

    // Fisher–Yates shuffle (best)
    for (let i = questions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [questions[i], questions[j]] = [questions[j], questions[i]];
    }

    return questions.slice(0, amount);
  },

  // ---------------------------------------------------------------------
  // 2. GRADE QUIZ (safe & validated)
  // ---------------------------------------------------------------------
  gradeQuiz: (answers: UserAnswer[], difficulty: string = "easy") => {
    const total = answers.length;
    let correct = 0;

    answers.forEach((userAnswer) => {
      const { index, answer } = userAnswer;

      // Validate index exists
      const question = QuizLoader.questions[index];
      if (!question) return;

      // Check answer
      if (question.correctAnswer === answer) {
        correct++;
      }
    });

    const score = Math.round((correct / total) * 100);

    // Difficulty progression
    let newDifficulty = difficulty;

    if (score >= 90) {
      newDifficulty = "hard";
    } else if (score >= 80) {
      if (difficulty !== "hard") newDifficulty = "medium";
    } else if (score < 50) {
      newDifficulty = "easy";
    }

    return {
      total,
      correct,
      score,
      previousDifficulty: difficulty,
      newDifficulty,
    };
  },

  // ---------------------------------------------------------------------
  // 3. DAILY QUIZ STREAK SUPPORT
  // ---------------------------------------------------------------------
  getUserStreak: async (userId: string) => {
    const record = await QuizStreak.findOne({ userId });

    if (!record) {
      return {
        streak: 0,
        lastCompleted: null,
      };
    }

    return {
      streak: record.streak,
      lastCompleted: record.lastCompleted,
    };
  },

};
