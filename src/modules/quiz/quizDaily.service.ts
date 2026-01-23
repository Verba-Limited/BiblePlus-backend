import AppError from "../../core/AppError";
import { QuizQuestion } from "./quizQuestion.model";
import { QuizDailyAttempt } from "./quizDailyAttempt";

export const QuizDailyService = {
  async getDailyQuiz(userId: string) {
    const today = new Date().toISOString().split("T")[0];

    const already = await QuizDailyAttempt.findOne({
      userId,
      date: today
    });

    if (already) {
      throw new AppError("Daily quiz already completed", 400);
    }

    const questions = await QuizQuestion.aggregate([
      { $match: { mode: "daily", active: true } },
      { $sample: { size: 5 } }
    ]);

    return {
      date: today,
      timer: 30,
      questions: questions.map(q => ({
        _id: q._id,
        question: q.question,
        image: q.image,
        options: q.options
      }))
    };
  },

  async submitDailyQuiz(userId: string, answers: any[]) {
    let correct = 0;

    for (const a of answers) {
      const q = await QuizQuestion.findById(a.questionId);
      if (q && q.correctAnswer === a.answer) correct++;
    }

    const score = Math.round((correct / answers.length) * 100);
    const today = new Date().toISOString().split("T")[0];

    await QuizDailyAttempt.create({
      userId,
      date: today,
      answers: {
        score
      }
    });

    return {
      score,
      correct,
      total: answers.length
    };
  }
};