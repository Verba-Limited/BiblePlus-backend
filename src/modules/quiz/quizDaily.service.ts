import AppError from "../../core/AppError";
import { QuizQuestion } from "./quizQuestion.model";
import { QuizDaily } from "./quizDaily.model";

const DAILY_QUESTION_COUNT = 5;

function today() {
  return new Date().toISOString().split("T")[0];
}

function yesterday() {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return d.toISOString().split("T")[0];
}

export const QuizDailyService = {
  /* =====================================================
     GET DAILY QUIZ BY DATE (today / yesterday / any)
  ===================================================== */
  async getByDate(date: string) {
    let daily = await QuizDaily.findOne({ date }).populate({
      path: "questions",
      match: { active: true },
      select: "question options image"
    });

    // Create daily quiz if not exists (only for today)
    if (!daily) {
      if (date !== today()) {
        throw new AppError("Daily quiz not found for this date", 404);
      }

      const questions = await QuizQuestion.aggregate([
        { $match: { mode: "daily", active: true } },
        { $sample: { size: DAILY_QUESTION_COUNT } }
      ]);

      if (!questions.length) {
        throw new AppError("No daily quiz questions available", 404);
      }

      daily = await QuizDaily.create({
        date,
        questions: questions.map(q => q._id)
      });

      daily = await daily.populate({
        path: "questions",
        select: "question options image"
      });
    }

    return {
      date,
      total: daily.questions.length,
      timer: 30,
      questions: daily.questions
    };
  },

  /* =====================================================
     HELPERS
  ===================================================== */
  today: async () => QuizDailyService.getByDate(today()),

  yesterday: async () => QuizDailyService.getByDate(yesterday()),

  history: async (limit = 30) => {
    return QuizDaily.find()
      .sort({ date: -1 })
      .limit(limit)
      .select("date")
      .lean();
  }
};