// src/modules/quiz/admin.quiz.service.ts
import AppError from "../../core/AppError";
import { QuizQuestion } from "./quizQuestion.model";

type QuizMode = "normal" | "puzzle" | "daily";

const MIN_LEVEL = 1;
const MAX_LEVEL = 10;

function validateQuestion(data: {
  question: string;
  options: string[];
  correctAnswer: number;
  mode: QuizMode;
  level?: number;
}) {
  const { question, options, correctAnswer, mode, level } = data;

  if (!question || typeof question !== "string") {
    throw new AppError("Question text is required", 400);
  }

  if (!Array.isArray(options) || options.length < 2) {
    throw new AppError("At least 2 options are required", 400);
  }

  if (
    typeof correctAnswer !== "number" ||
    correctAnswer < 0 ||
    correctAnswer >= options.length
  ) {
    throw new AppError("Invalid correctAnswer index", 400);
  }

  if (!["normal", "puzzle", "daily"].includes(mode)) {
    throw new AppError(
      "Mode must be normal, puzzle, or daily",
      400
    );
  }

  // ✅ Only enforce level when NOT daily
  if (mode !== "daily") {
    if (
      typeof level !== "number" ||
      level < MIN_LEVEL ||
      level > MAX_LEVEL
    ) {
      throw new AppError(
        "Level must be between 1 and 10",
        400
      );
    }
  }
}

export const AdminQuizService = {
  /* ============================
      CREATE QUESTION
  ============================ */
  async create(data: any) {
    validateQuestion(data);

    return QuizQuestion.create({
      question: data.question,
      options: data.options,
      correctAnswer: data.correctAnswer,
      mode: data.mode,
      level: data.mode === "daily" ? undefined : data.level,
      image: data.image ?? null,
      active: data.active ?? true
    });
  },

  /* ============================
      UPDATE QUESTION
  ============================ */
  async update(id: string, data: any) {
    if (!id) throw new AppError("Question ID required", 400);

    const existing = await QuizQuestion.findById(id);
    if (!existing) {
      throw new AppError("Question not found", 404);
    }

    // Merge old + new safely
    const merged = {
      question: data.question ?? existing.question,
      options: data.options ?? existing.options,
      correctAnswer:
        data.correctAnswer ?? existing.correctAnswer,
      mode: data.mode ?? existing.mode,
      level:
        (data.mode ?? existing.mode) === "daily"
          ? undefined
          : data.level ?? existing.level
    };

    validateQuestion(merged);

    return QuizQuestion.findByIdAndUpdate(
      id,
      {
        ...data,
        level:
          merged.mode === "daily"
            ? undefined
            : merged.level
      },
      { new: true, runValidators: true }
    );
  },

  /* ============================
      DELETE QUESTION
  ============================ */
  async delete(id: string) {
    if (!id) throw new AppError("Question ID required", 400);

    const deleted = await QuizQuestion.findByIdAndDelete(id);
    if (!deleted) {
      throw new AppError("Question not found", 404);
    }

    return true;
  },

  /* ============================
      TOGGLE ACTIVE STATUS
  ============================ */
  async toggle(id: string) {
    if (!id) throw new AppError("Question ID required", 400);

    const question = await QuizQuestion.findById(id);
    if (!question) {
      throw new AppError("Question not found", 404);
    }

    question.active = !question.active;
    await question.save();

    return question;
  },

  /* ============================
      BULK CREATE (ADMIN IMPORT)
  ============================ */
  async bulkCreate(questions: any[]) {
    if (!Array.isArray(questions) || !questions.length) {
      throw new AppError("Questions array is required", 400);
    }

    const docs = questions.map((q) => {
      validateQuestion(q);

      return {
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        mode: q.mode,
        level: q.mode === "daily" ? undefined : q.level,
        image: q.image ?? null,
        active: q.active ?? true
      };
    });

    return QuizQuestion.insertMany(docs);
  }
};