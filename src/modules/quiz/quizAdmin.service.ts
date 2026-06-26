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

  async addBulk(questions: any[]) {

  if (!Array.isArray(questions)) {
    throw new AppError("Must send array of questions", 400);
  }

  for (const q of questions) {
    if (!q.options || q.options.length !== 4) {
      throw new AppError("Each question must have 4 options", 400);
    }

    if (!q.options.includes(q.correctAnswer)) {
      throw new AppError("Correct answer must match one option", 400);
    }
  }

  return QuizQuestion.insertMany(
    questions.map(q => ({
      ...q,
      source: "admin",
      active: true
    }))
  );
},

  async deactivateQuestion(id: string) {
    const updated = await QuizQuestion.findByIdAndUpdate(
      id,
      { active: false },
      { returnDocument: "after" }
    );

    if (!updated) {
      throw new AppError("Question not found", 404);
    }

    return updated;
  }

};