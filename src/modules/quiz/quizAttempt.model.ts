import mongoose, { Schema, Document } from "mongoose";

export interface IQuizAttempt extends Document {
  userId: string;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  category: string;
  createdAt: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    userId: { type: String, required: true },
    score: { type: Number, required: true },
    totalQuestions: { type: Number, required: true },
    correctAnswers: { type: Number, required: true },
    category: { type: String, required: true },
  },
  { timestamps: true }
);

export const QuizAttempt = mongoose.model<IQuizAttempt>(
  "QuizAttempt",
  quizAttemptSchema
);
