import mongoose from "mongoose";

const quizDailyAttemptSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    date: { type: Date, required: true },
    answers: { score: { type: Number, required: true } }
  },
  { timestamps: true }
);

export const QuizDailyAttempt = mongoose.model(
  "QuizDailyAttempt",
  quizDailyAttemptSchema
);