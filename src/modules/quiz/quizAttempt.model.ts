import mongoose from "mongoose";

const quizAttemptSchema = new mongoose.Schema(
  {
    userId: String,
    mode: String,
    level: Number,
    score: Number,
    correct: Number,
    total: Number
  },
  { timestamps: true }
);

export const QuizAttempt = mongoose.model(
  "QuizAttempt",
  quizAttemptSchema
);