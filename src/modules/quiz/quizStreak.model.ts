import mongoose, { Schema, Document } from "mongoose";

export interface IQuizStreak extends Document {
  userId: string;
  lastCompleted: string;
  streak: number;
}

const quizStreakSchema = new Schema<IQuizStreak>({
  userId: { type: String, required: true },
  lastCompleted: { type: String, required: true }, // e.g. "Fri Nov 29 2025"
  streak: { type: Number, default: 1 }
});

export const QuizStreak = mongoose.model<IQuizStreak>("QuizStreak", quizStreakSchema);
