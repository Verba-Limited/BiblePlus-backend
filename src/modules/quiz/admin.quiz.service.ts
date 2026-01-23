// src/modules/quiz/admin.quiz.service.ts
import AppError from "../../core/AppError";
import { QuizQuestion } from "./quizQuestion.model";

export const AdminQuizService = {
  // CREATE QUESTION
  create: async (data: any) => {
    if (!data.question || !data.options || data.correctAnswer === undefined) {
      throw new AppError("Invalid quiz question data", 400);
    }

    return await QuizQuestion.create(data);
  },

  // UPDATE QUESTION
  update: async (id: string, data: any) => {
    const updated = await QuizQuestion.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    });

    if (!updated) throw new AppError("Question not found", 404);
    return updated;
  },

  // DELETE QUESTION
  delete: async (id: string) => {
    const deleted = await QuizQuestion.findByIdAndDelete(id);
    if (!deleted) throw new AppError("Question not found", 404);
    return true;
  },

  // TOGGLE ACTIVE
  toggle: async (id: string) => {
    const q = await QuizQuestion.findById(id);
    if (!q) throw new AppError("Question not found", 404);

    q.active = !q.active;
    await q.save();
    return q;
  },

  // BULK ADD QUESTIONS
  bulkCreate: async (questions: any[]) => {
    if (!Array.isArray(questions)) {
      throw new AppError("Questions must be an array", 400);
    }

    return await QuizQuestion.insertMany(questions);
  }
};