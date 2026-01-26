import mongoose, { Schema, Document } from "mongoose";

export interface IQuizQuestion extends Document {
  question: string;
  options: string[];
  correctAnswer: number;
  mode: "normal" | "puzzle" | "daily";
  level?: number;
  image?: string;
  active: boolean;
}

const quizQuestionSchema = new Schema<IQuizQuestion>(
  {
    question: {
      type: String,
      required: true,
      trim: true
    },

    options: {
      type: [String],
      required: true,
      validate: {
        validator: (v: string[]) => v.length >= 2,
        message: "At least 2 options are required"
      }
    },

    correctAnswer: {
      type: Number,
      required: true
    },

    mode: {
      type: String,
      enum: ["normal", "puzzle", "daily"],
      required: true
    },

    level: {
      type: Number,
      min: 1,
      max: 10,
      required: function (this: IQuizQuestion) {
        return this.mode !== "daily";
      }
    },

    image: {
      type: String
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