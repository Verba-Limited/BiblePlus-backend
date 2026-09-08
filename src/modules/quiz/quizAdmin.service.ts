import AppError from "../../core/AppError";
import { QuizQuestion } from "./quizQuestion.model";
import { escapeRegex, sanitizeUpdate } from "../../utils/sanitize";

const DIFFICULTIES = ["easy", "medium", "hard", "expert"] as const;
const REQUIRED_OPTIONS = 4;

/* =========================================================
   NORMALISE A QUESTION PAYLOAD

   The old API demanded one exact shape: `options` had to be
   an array of exactly 4 strings and `correctAnswer` had to
   be a string that matched one of them character for
   character. Anything else threw — and a missing `options`
   crashed on `.length` before validation even ran, so the
   editor got a bare 500 with nothing to act on.

   Accept the shapes an editor actually sends, and explain
   precisely what is wrong when we can't.
========================================================= */
const normaliseQuestion = (raw: any, index?: number) => {
  const where = index === undefined ? "" : ` (question ${index + 1})`;
  const fail = (msg: string) => {
    throw new AppError(`${msg}${where}`, 400);
  };

  if (!raw || typeof raw !== "object") fail("Each question must be an object");

  const question: string = String(raw.question ?? raw.text ?? "").trim();
  if (!question) fail("`question` is required");

  /* ---- Options ---- */
  let options = raw.options ?? raw.choices ?? raw.answers;

  // A comma-separated string is a common form-field shape
  if (typeof options === "string") {
    options = options.split(",").map((o: string) => o.trim());
  }

  if (Array.isArray(options)) {
    options = options.map((o: any) => String(o ?? "").trim()).filter(Boolean);
  }

  if (!Array.isArray(options)) {
    fail("`options` must be an array of 4 answer choices");
  }

  const opts: string[] = options as string[];

  if (opts.length !== REQUIRED_OPTIONS) {
    fail(
      `Provide exactly ${REQUIRED_OPTIONS} non-empty options — received ${opts.length}`
    );
  }

  if (new Set(opts).size !== opts.length) {
    fail("Options must be unique");
  }

  /* ---- Correct answer: accept the text OR a 0/1-based index ---- */
  let correctAnswer: string | undefined;
  const rawCorrect = raw.correctAnswer ?? raw.answer ?? raw.correct;
  const rawIndex = raw.correctIndex ?? raw.correctOption;

  if (rawIndex !== undefined && rawIndex !== null && rawIndex !== "") {
    const i = Number(rawIndex);
    if (!Number.isInteger(i)) fail("`correctIndex` must be a whole number");
    // Tolerate 1-based indexes from spreadsheets
    const zeroBased = i >= 1 && i <= REQUIRED_OPTIONS ? i - 1 : i;
    if (zeroBased < 0 || zeroBased >= REQUIRED_OPTIONS) {
      fail(`\`correctIndex\` must point at one of the ${REQUIRED_OPTIONS} options`);
    }
    correctAnswer = opts[zeroBased];
  } else if (rawCorrect !== undefined && rawCorrect !== null && rawCorrect !== "") {
    const text = String(rawCorrect).trim();

    // A bare number in `correctAnswer` is an index, not an answer
    if (/^\d+$/.test(text)) {
      const i = Number(text);
      const zeroBased = i >= 1 && i <= REQUIRED_OPTIONS ? i - 1 : i;
      if (zeroBased >= 0 && zeroBased < REQUIRED_OPTIONS) {
        correctAnswer = opts[zeroBased];
      }
    }

    if (!correctAnswer) {
      // Match case-insensitively so "Moses" and "moses" agree
      const match = opts.find(
        (o: string) => o.toLowerCase() === text.toLowerCase()
      );
      if (!match) {
        fail(
          `\`correctAnswer\` must be one of the options, or an index 1-${REQUIRED_OPTIONS}. ` +
            `Received "${text}"; options are: ${opts.join(" | ")}`
        );
      }
      correctAnswer = match;
    }
  } else {
    fail("`correctAnswer` (or `correctIndex`) is required");
  }

  /* ---- Level ---- */
  const level = Number(raw.level ?? 1);
  if (!Number.isInteger(level) || level < 1) {
    fail("`level` must be a whole number of 1 or more");
  }

  /* ---- Difficulty ---- */
  const difficulty = String(raw.difficulty ?? "easy").toLowerCase();
  if (!DIFFICULTIES.includes(difficulty as any)) {
    fail(`\`difficulty\` must be one of: ${DIFFICULTIES.join(", ")}`);
  }

  return {
    question,
    options: opts,
    correctAnswer: correctAnswer as string,
    level,
    difficulty: difficulty as (typeof DIFFICULTIES)[number],
    source: "admin" as const,
    active: raw.active === undefined ? true : raw.active !== false,
  };
};

/** Accept a bare array, or { questions: [...] } / { data: [...] } / { items: [...] } */
const readQuestionArray = (body: any): any[] => {
  if (Array.isArray(body)) return body;

  const nested = body?.questions ?? body?.data ?? body?.items;
  if (Array.isArray(nested)) return nested;

  throw new AppError(
    'Send either an array of questions, or an object shaped { "questions": [ ... ] }',
    400
  );
};

export const QuizAdminService = {
  normaliseQuestion,

  /* =====================================================
     LIST QUESTIONS
  ===================================================== */
  async listQuestions(filters: any = {}) {
    const query: any = {};

    if (filters.level) query.level = Number(filters.level);
    if (filters.difficulty) query.difficulty = String(filters.difficulty).toLowerCase();
    if (filters.source) query.source = filters.source;

    // Default to active questions; ?active=all shows deactivated ones too
    if (filters.active === "all") {
      // no filter
    } else if (filters.active !== undefined) {
      query.active = filters.active === "true" || filters.active === true;
    }

    const term = (filters.search || "").trim();
    if (term) {
      const safe = escapeRegex(term);
      query.$or = [
        { question: { $regex: safe, $options: "i" } },
        { options: { $regex: safe, $options: "i" } },
      ];
    }

    const page = Math.max(Number(filters.page) || 1, 1);
    const limit = Math.min(Math.max(Number(filters.limit) || 20, 1), 100);

    const [questions, total, active, inactive] = await Promise.all([
      QuizQuestion.find(query)
        .sort({ level: 1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      QuizQuestion.countDocuments(query),
      QuizQuestion.countDocuments({ active: true }),
      QuizQuestion.countDocuments({ active: false }),
    ]);

    const pages = Math.ceil(total / limit) || 1;

    return {
      questions,
      counts: { all: active + inactive, active, inactive },
      pagination: {
        total,
        count: questions.length,
        page,
        limit,
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1,
      },
    };
  },

  async getQuestion(id: string) {
    const found = await QuizQuestion.findById(id);
    if (!found) throw new AppError("Question not found", 404);
    return found;
  },

  /* =====================================================
     METADATA — what the editor's dropdowns should offer
  ===================================================== */
  async getMeta() {
    const [levels, usedDifficulties, total] = await Promise.all([
      QuizQuestion.distinct("level"),
      QuizQuestion.distinct("difficulty"),
      QuizQuestion.countDocuments({}),
    ]);

    const perLevel = await QuizQuestion.aggregate([
      { $group: { _id: { level: "$level", difficulty: "$difficulty" }, count: { $sum: 1 } } },
      { $sort: { "_id.level": 1 } },
    ]);

    return {
      levels: levels.sort((a: number, b: number) => a - b),
      difficulties: DIFFICULTIES,
      usedDifficulties,
      optionsRequired: REQUIRED_OPTIONS,
      totalQuestions: total,
      breakdown: perLevel.map((r: any) => ({
        level: r._id.level,
        difficulty: r._id.difficulty,
        count: r.count,
      })),
    };
  },

  /* =====================================================
     CREATE — ONE
  ===================================================== */
  async addQuestion(data: any) {
    return QuizQuestion.create(normaliseQuestion(data));
  },

  /* =====================================================
     CREATE — BULK

     Validates every row first and reports each problem with
     its row number, instead of dying on the first bad one.
  ===================================================== */
  async addBulk(body: any) {
    const rows = readQuestionArray(body);

    if (!rows.length) {
      throw new AppError("No questions provided", 400);
    }

    const prepared: any[] = [];
    const errors: { index: number; message: string }[] = [];

    rows.forEach((row, i) => {
      try {
        prepared.push(normaliseQuestion(row, i));
      } catch (err: any) {
        errors.push({ index: i, message: err.message });
      }
    });

    if (!prepared.length) {
      throw new AppError(
        `No valid questions. ${errors.map((e) => e.message).join("; ")}`,
        400
      );
    }

    const inserted = await QuizQuestion.insertMany(prepared);

    return {
      inserted: inserted.length,
      skipped: errors.length,
      errors,
      questions: inserted,
    };
  },

  /* =====================================================
     UPDATE
  ===================================================== */
  async updateQuestion(id: string, data: any) {
    const existing = await QuizQuestion.findById(id);
    if (!existing) throw new AppError("Question not found", 404);

    const payload = sanitizeUpdate(data, ["source"]);

    // Re-validate against the merged record so a partial edit
    // (just the options, say) is still checked as a whole.
    const merged = normaliseQuestion({
      question: payload.question ?? existing.question,
      options: payload.options ?? existing.options,
      correctAnswer:
        payload.correctAnswer ?? payload.correctIndex ?? existing.correctAnswer,
      correctIndex: payload.correctIndex,
      level: payload.level ?? existing.level,
      difficulty: payload.difficulty ?? existing.difficulty,
      active: payload.active ?? existing.active,
    });

    existing.set(merged);
    return existing.save();
  },

  /* =====================================================
     DEACTIVATE / REACTIVATE / DELETE
  ===================================================== */
  async setActive(id: string, active: boolean) {
    const updated = await QuizQuestion.findByIdAndUpdate(
      id,
      { active },
      { returnDocument: "after" }
    );

    if (!updated) throw new AppError("Question not found", 404);
    return updated;
  },

  async deactivateQuestion(id: string) {
    return QuizAdminService.setActive(id, false);
  },

  async activateQuestion(id: string) {
    return QuizAdminService.setActive(id, true);
  },

  /** Permanent removal — the portal had no way to do this at all. */
  async deleteQuestion(id: string) {
    const removed = await QuizQuestion.findByIdAndDelete(id);
    if (!removed) throw new AppError("Question not found", 404);
    return removed;
  },

  /** Remove several at once, for the editor's multi-select. */
  async deleteMany(ids: any) {
    const list = Array.isArray(ids) ? ids : [ids];
    if (!list.length) throw new AppError("No question ids provided", 400);

    const result = await QuizQuestion.deleteMany({ _id: { $in: list } });
    return { deleted: result.deletedCount ?? 0 };
  },
};
