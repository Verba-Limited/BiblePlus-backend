// src/modules/quiz/quizAttempt.model.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IQuizAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  level: number;
  score: number;
  correct: number;
  total: number;
  createdAt: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    level: { type: Number, required: true },
    score: { type: Number, required: true },
    correct: { type: Number, required: true },
    total: { type: Number, required: true }
  },
  { timestamps: true }
);

quizAttemptSchema.index({ userId: 1, level: 1 });

export const QuizAttempt = mongoose.model<IQuizAttempt>(
  "QuizAttempt",
  quizAttemptSchema
);