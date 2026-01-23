import mongoose, { Schema, Document } from "mongoose";

export interface IQuizProgress extends Document {
  userId: string;
  level: number;
  xp: number;
}

const quizProgressSchema = new Schema<IQuizProgress>(
  {
    userId: { type: String, required: true, unique: true },
    level: { type: Number, default: 1 },
    xp: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const QuizProgress = mongoose.model<IQuizProgress>(
  "QuizProgress",
  quizProgressSchema
);