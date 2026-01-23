// src/modules/quiz/quizQuestion.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IQuizQuestion extends Document {
  question: string;
  options: string[];
  correctAnswer: number;
  image?: string;
  mode: "general" | "puzzle" | "daily";
  level: number; // 1–10
  active: boolean;
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true },
    image: { type: String },
    mode: {
      type: String,
      enum: ["general", "puzzle", "daily"],
      required: true
    },
    level: { type: Number, min: 1, max: 10, required: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const QuizQuestion = mongoose.model<IQuizQuestion>(
  "QuizQuestion",
  quizQuestionSchema
);