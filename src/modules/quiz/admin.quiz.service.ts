// src/modules/quiz/admin.quiz.service.ts
import AppError from "../../core/AppError";
import { QuizQuestion } from "./quizQuestion.model";

const VALID_MODES = ["normal", "puzzle", "daily"];
const MIN_LEVEL = 1;
const MAX_LEVEL = 10;

function validateQuestion(data: any) {
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

  if (!VALID_MODES.includes(mode)) {
    throw new AppError(
      `Invalid mode. Allowed: ${VALID_MODES.join(", ")}`,
      400
    );
  }

  if (
    typeof level !== "number" ||
    level < MIN_LEVEL ||
    level > MAX_LEVEL
  ) {
    throw new AppError("Level must be between 1 and 10", 400);
  }
}

export const AdminQuizService = {
  /* ============================
      CREATE QUESTION
  ============================ */
  async create(data: any) {
    validateQuestion(data);

    return await QuizQuestion.create({
      question: data.question,
      options: data.options,
      correctAnswer: data.correctAnswer,
      mode: data.mode,
      level: data.level,
      image: data.image ?? null,
      active: data.active ?? true
    });
  },

  /* ============================
      UPDATE QUESTION
  ============================ */
  async update(id: string, data: any) {
    if (!id) throw new AppError("Question ID required", 400);

    // Validate only if key fields are being changed
    if (
      data.question ||
      data.options ||
      data.correctAnswer !== undefined ||
      data.mode ||
      data.level
    ) {
      validateQuestion({
        question: data.question ?? "temp",
        options: data.options ?? ["a", "b"],
        correctAnswer:
          data.correctAnswer ?? 0,
        mode: data.mode ?? "normal",
        level: data.level ?? 1
      });
    }

    const updated = await QuizQuestion.findByIdAndUpdate(
      id,
      data,
      { new: true, runValidators: true }
    );

    if (!updated) {
      throw new AppError("Question not found", 404);
    }

    return updated;
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

    for (const q of questions) {
      validateQuestion(q);
    }

    return await QuizQuestion.insertMany(
      questions.map(q => ({
        question: q.question,
        options: q.options,
        correctAnswer: q.correctAnswer,
        mode: q.mode,
        level: q.level,
        image: q.image ?? null,
        active: q.active ?? true
      }))
    );
  }
};