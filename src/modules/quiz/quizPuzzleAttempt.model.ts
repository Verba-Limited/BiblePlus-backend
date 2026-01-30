// src/modules/quiz/quizPuzzleAttempt.model.ts
import mongoose from "mongoose";

const quizPuzzleAttemptSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    date: { type: String, required: true }, // YYYY-MM-DD
    score: Number,
    completed: { type: Boolean, default: false }
  },
  { timestamps: true }
);

quizPuzzleAttemptSchema.index({ userId: 1, date: 1 }, { unique: true });

export const QuizPuzzleAttempt = mongoose.model(
  "QuizPuzzleAttempt",
  quizPuzzleAttemptSchema
);