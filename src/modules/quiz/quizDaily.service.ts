import AppError from "../../core/AppError";
import { QuizDaily } from "./quizDaily.model";
import versePool from "./verse-pool.json";

/* =====================================================
   TYPES
===================================================== */
interface VerseQuestion {
  id: number;
  passage: string;
  options: string[];
  correctAnswer: string;
  hint: string;
}

const todayKey = () => new Date().toISOString().split("T")[0];

/* =====================================================
   DETERMINISTIC DAILY PICKER
   Same date always returns same 3 questions.
   Checks DB first for admin-added questions.
===================================================== */
function pickQuestionsForDate(date: string, pool: VerseQuestion[]): VerseQuestion[] {
  const seed = parseInt(date.replace(/-/g, ""), 10);
  const total = pool.length;
  const picked: VerseQuestion[] = [];
  const usedIndexes = new Set<number>();

  let i = 0;
  while (picked.length < 3) {
    const index = (seed + i * 37) % total;
    if (!usedIndexes.has(index)) {
      usedIndexes.add(index);
      picked.push(pool[index]);
    }
    i++;
  }

  return picked;
}

export const QuizDailyService = {

  /* =====================================================
     GET TODAY'S QUIZ
     - Checks DB for admin override first
     - Falls back to deterministic JSON pool pick
  ===================================================== */
  async getToday() {
    const today = todayKey();

    // Check if admin manually set questions for today
    const adminOverride = await QuizDaily.findOne({ date: today }).lean();

    let questions: VerseQuestion[];

    if (adminOverride && adminOverride.questions?.length > 0) {
      questions = adminOverride.questions as VerseQuestion[];
    } else {
      // Auto-pick from JSON pool based on date seed
      const pool = versePool as VerseQuestion[];
      questions = pickQuestionsForDate(today, pool);
    }

    return {
      date: today,
      total: questions.length,
      timer: 30,
      isAdminSet: !!adminOverride,
      questions: questions.map((q, index) => ({
        id: index + 1,
        passage: q.passage,
        options: q.options,
        correctAnswer: q.correctAnswer,
        hint: q.hint
      }))
    };
  },

  /* =====================================================
     GET QUIZ BY SPECIFIC DATE (history / replay)
  ===================================================== */
  async getByDate(date: string) {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    // Check DB for admin override on that date
    const adminOverride = await QuizDaily.findOne({ date }).lean();

    let questions: VerseQuestion[];

    if (adminOverride && adminOverride.questions?.length > 0) {
      questions = adminOverride.questions as VerseQuestion[];
    } else {
      const pool = versePool as VerseQuestion[];
      questions = pickQuestionsForDate(date, pool);
    }

    return {
      date,
      total: questions.length,
      timer: 30,
      isAdminSet: !!adminOverride,
      questions: questions.map((q, index) => ({
        id: index + 1,
        passage: q.passage,
        options: q.options,
        correctAnswer: q.correctAnswer,
        hint: q.hint
      }))
    };
  },

  /* =====================================================
     ADMIN: SET CUSTOM QUESTIONS FOR A SPECIFIC DATE
     Overrides the auto-picked pool for that day
  ===================================================== */
  async adminSetForDate(date: string, questions: VerseQuestion[]) {
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new AppError("Invalid date format. Use YYYY-MM-DD", 400);
    }

    if (!questions || questions.length !== 3) {
      throw new AppError("Exactly 3 questions are required", 400);
    }

    for (const q of questions) {
      if (!q.passage || !q.options || !q.correctAnswer || !q.hint) {
        throw new AppError(
          "Each question must have passage, options, correctAnswer, and hint",
          400
        );
      }

      if (q.options.length !== 3) {
        throw new AppError("Each question must have exactly 3 options", 400);
      }

      if (!q.options.includes(q.correctAnswer)) {
        throw new AppError(
          `correctAnswer "${q.correctAnswer}" must be one of the options`,
          400
        );
      }
    }

    // Upsert — replace if exists, create if not
    const saved = await QuizDaily.findOneAndUpdate(
      { date },
      { date, questions, locked: true },
      { upsert: true, returnDocument: "after" }
    );

    return saved;
  },

  /* =====================================================
     ADMIN: ADD A QUESTION TO THE LIVE JSON POOL
     Returns the new question so admin can verify
     Note: to permanently persist, write to verse-pool.json
     or store custom pool in DB.
  ===================================================== */
  async adminAddToPool(question: Omit<VerseQuestion, "id">) {
    if (!question.passage || !question.options || !question.correctAnswer || !question.hint) {
      throw new AppError(
        "Question must have passage, options, correctAnswer, and hint",
        400
      );
    }

    if (question.options.length !== 3) {
      throw new AppError("Question must have exactly 3 options", 400);
    }

    if (!question.options.includes(question.correctAnswer)) {
      throw new AppError(
        `correctAnswer "${question.correctAnswer}" must be one of the options`,
        400
      );
    }

    const pool = versePool as VerseQuestion[];
    const newQuestion: VerseQuestion = {
      ...question,
      id: pool.length + 1
    };

    // In-memory add (survives until server restart)
    pool.push(newQuestion);

    return {
      message: "Question added to pool for this session. To persist, update verse-pool.json.",
      addedQuestion: newQuestion,
      totalPoolSize: pool.length
    };
  },

  /* =====================================================
     GET POOL INFO
  ===================================================== */
  async getPoolInfo() {
    const pool = versePool as VerseQuestion[];
    return {
      totalQuestions: pool.length,
      coverage: `${Math.floor(pool.length / 3)} unique days before repeating`
    };
  },

  /* =====================================================
     HISTORY — last N admin-set quizzes
  ===================================================== */
  async history(limit = 30) {
    return QuizDaily.find()
      .sort({ date: -1 })
      .limit(limit)
      .lean();
  }
};