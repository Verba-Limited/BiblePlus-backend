import mongoose, { Schema, Document } from "mongoose";

export interface IQuizQuestion extends Document {
  question: string;
  options: string[];
  correctAnswer: number;
  category: "ot" | "nt" | "general";
  difficulty: "easy" | "medium" | "hard";
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: Number, required: true }, // index of options array
    category: {
      type: String,
      enum: ["ot", "nt", "general"],
      default: "general",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
  },
  { timestamps: true }
);

export const QuizQuestion = mongoose.model<IQuizQuestion>(
  "QuizQuestion",
  quizQuestionSchema
);
