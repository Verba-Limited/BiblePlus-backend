import AppError from "../../core/AppError";
import { QuizQuestion } from "./quizQuestion.model";

export const QuizAdminService = {
  createQuestion: async (data: any) => {
    return await QuizQuestion.create(data);
  },

  updateQuestion: async (id: string, data: any) => {
    const q = await QuizQuestion.findByIdAndUpdate(id, data, {
      new: true
    });
    if (!q) throw new AppError("Question not found", 404);
    return q;
  },

  deleteQuestion: async (id: string) => {
    await QuizQuestion.findByIdAndDelete(id);
    return true;
  },

  getAll: async () => {
    return await QuizQuestion.find().sort({ createdAt: -1 });
  }
};