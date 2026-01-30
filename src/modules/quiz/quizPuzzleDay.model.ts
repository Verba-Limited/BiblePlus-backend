// src/modules/quiz/quizPuzzleDay.model.ts
import mongoose from "mongoose";

const quizPuzzleDaySchema = new mongoose.Schema(
  {
    date: { type: String, required: true, unique: true }, // YYYY-MM-DD
    questionIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "QuizQuestion" }],
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const QuizPuzzleDay = mongoose.model(
  "QuizPuzzleDay",
  quizPuzzleDaySchema
);