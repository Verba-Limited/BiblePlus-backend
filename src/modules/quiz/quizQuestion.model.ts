import mongoose from "mongoose";

const quizQuestionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    image: String,

    options: {
      type: [String],
      required: true,
      validate: (v: string[]) => v.length >= 2
    },

    correctAnswer: { type: Number, required: true },

    mode: {
      type: String,
      enum: ["general", "daily", "puzzle"],
      required: true
    },

    level: { type: Number, default: 1 },

    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy"
    },

    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

export const QuizQuestion = mongoose.model(
  "QuizQuestion",
  quizQuestionSchema
);