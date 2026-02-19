import mongoose, { Schema, Document } from "mongoose";

export interface IQuizQuestion extends Document {
  question: string;
  options: string[];
  correctAnswer: string;
  level: number;
  difficulty: "easy" | "medium" | "hard" | "expert";
  source: "admin" | "ai";
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length === 4,
        message: "Must have exactly 4 options"
      }
    },
    correctAnswer: { type: String, required: true },
    level: { type: Number, required: true, index: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "expert"],
      required: true
    },
    source: {
      type: String,
      enum: ["admin", "ai"],
      default: "admin"
    },
    active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const QuizQuestion = mongoose.model<IQuizQuestion>(
  "QuizQuestion",
  quizQuestionSchema
);