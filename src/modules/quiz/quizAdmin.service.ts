import AppError from "../../core/AppError";
import { QuizQuestion } from "./quizQuestion.model";

export const QuizAdminService = {

  async addQuestion(data: any) {
    if (data.options.length !== 4) {
      throw new AppError("Must provide exactly 4 options", 400);
    }

    if (!data.options.includes(data.correctAnswer)) {
      throw new AppError("Correct answer must match one option", 400);
    }

    return QuizQuestion.create({
      ...data,
      source: "admin",
      active: true
    });
  },

  async deactivateQuestion(id: string) {
    const updated = await QuizQuestion.findByIdAndUpdate(
      id,
      { active: false },
      { new: true }
    );

    if (!updated) {
      throw new AppError("Question not found", 404);
    }

    return updated;
  }

};