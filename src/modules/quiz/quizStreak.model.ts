import mongoose, { Schema, Document } from "mongoose";

export interface IQuizStreak extends Document {
  userId: string;
  lastCompleted: string; // "2025-12-12"
  streak: number;
  updatedAt: Date;
  createdAt: Date;
}

const quizStreakSchema = new Schema<IQuizStreak>(
  {
    userId: { type: String, required: true, index: true, unique: true },

    // Always store the date as YYYY-MM-DD → timezone safe
    lastCompleted: { type: String, required: true },

    streak: { type: Number, default: 1 }
  },
  { timestamps: true }
);

// Ensure uniqueness — one streak per user
quizStreakSchema.index({ userId: 1 }, { unique: true });

export const QuizStreak = mongoose.model<IQuizStreak>(
  "QuizStreak",
  quizStreakSchema
);
