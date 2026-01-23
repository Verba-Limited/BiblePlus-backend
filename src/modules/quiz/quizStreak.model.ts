import mongoose, { Schema, Document } from "mongoose";

export interface IQuizStreak extends Document {
  userId: string;
  lastPlayed: string; // YYYY-MM-DD
  streak: number;
}

const quizStreakSchema = new Schema<IQuizStreak>(
  {
    userId: { type: String, required: true, index: true },
    lastPlayed: { type: String, required: true },
    streak: { type: Number, default: 1 }
  },
  { timestamps: true }
);

export const QuizStreak = mongoose.model<IQuizStreak>(
  "QuizStreak",
  quizStreakSchema
);