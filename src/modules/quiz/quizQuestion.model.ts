import mongoose, { Schema, Document } from "mongoose";

export interface IQuizQuestion extends Document {
  question: string;
  options: string[];
  correctAnswer: number;
  mode: "normal" | "daily" | "puzzle";
  level: number;
  image?: string;
  active: boolean;
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      validate: [(v: string[]) => v.length >= 2, "At least 2 options required"]
    },
    correctAnswer: { type: Number, required: true },

    mode: {
      type: String,
      enum: ["normal", "daily", "puzzle"],
      required: true
    },

    level: {
      type: Number,
      min: 1,
      max: 10,
      required: true
    },

    image: { type: String },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const QuizQuestion = mongoose.model<IQuizQuestion>(
  "QuizQuestion",
  quizQuestionSchema
);