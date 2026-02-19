import AppError from "../../core/AppError";
import { QuizDaily } from "./quizDaily.model";

const todayKey = () =>
  new Date().toISOString().split("T")[0];

export const QuizDailyService = {

  /* =====================================================
     GET TODAY QUIZ
  ===================================================== */
  async getToday() {
    const today = todayKey();

    const daily = await QuizDaily.findOne({ date: today }).lean();

    if (!daily) {
      throw new AppError("No daily quiz available today", 404);
    }

    return {
      date: daily.date,
      total: daily.questions.length,
      timer: 60, // seconds per question or total timer
      questions: daily.questions.map((q: any, index: number) => ({
        id: index + 1,
        question: q.question,
        options: q.options,
        reference: q.reference,
        correctAnswer: q.correctAnswer 
      }))
    };
  },

  /* =====================================================
     ADMIN CREATE DAILY QUIZ
  ===================================================== */
  async adminCreate(date: string, questions: any[], locked = true) {

    if (!date) {
      throw new AppError("Date is required", 400);
    }

    if (!questions || questions.length !== 5) {
      throw new AppError(
        "Daily quiz must contain exactly 5 questions",
        400
      );
    }

    // remove existing quiz for same date
    await QuizDaily.deleteMany({ date });

    const created = await QuizDaily.create({
      date,
      questions,
      locked
    });

    return created;
  },

  /* =====================================================
     HISTORY
  ===================================================== */
  async history(limit = 30) {
    return QuizDaily.find()
      .sort({ date: -1 })
      .limit(limit)
      .lean();
  }
};