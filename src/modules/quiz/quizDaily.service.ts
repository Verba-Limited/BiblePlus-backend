import AppError from "../../core/AppError";
import { QuizQuestion } from "./quizQuestion.model";
import { QuizDaily } from "./quizDaily.model";

const DAILY_QUESTION_COUNT = 5;

const dayKey = (d = new Date()) =>
  d.toISOString().split("T")[0];

const yesterdayKey = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  return dayKey(d);
};

export const QuizDailyService = {
  /* =====================================================
     GET DAILY QUIZ BY DATE
     (today / yesterday / any past day)
  ===================================================== */
  async getByDate(
    date: string,
    options?: {
      revealAnswers?: boolean;
      isAdmin?: boolean;
    }
  ) {
    let daily = await QuizDaily.findOne({ date }).populate({
      path: "questions",
      match: { active: true },
      select: "question options image correctAnswer"
    });

    // Create ONLY today's quiz if missing
    if (!daily) {
      if (date !== dayKey()) {
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
        select: "question options image correctAnswer"
      });
    }

    const canReveal =
      options?.revealAnswers === true &&
      options?.isAdmin === true;

    return {
      date,
      timer: 30,
      total: daily.questions.length,
      questions: daily.questions.map((q: any) => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        image: q.image ?? null,

        ...(canReveal && {
        
          correctAnswer: q.correctAnswer + 1
        })
      }))
    };
  },

  /* =====================================================
     SHORTCUT HELPERS
  ===================================================== */
  today: async (opts?: { revealAnswers?: boolean; isAdmin?: boolean }) =>
    QuizDailyService.getByDate(dayKey(), opts),

  yesterday: async (opts?: { revealAnswers?: boolean; isAdmin?: boolean }) =>
    QuizDailyService.getByDate(yesterdayKey(), opts),

  history: async (limit = 30) => {
    return QuizDaily.find()
      .sort({ date: -1 })
      .limit(limit)
      .select("date")
      .lean();
  }
};