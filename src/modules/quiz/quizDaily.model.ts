import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuizDailyQuestion {
  question: string;
  options: string[];
  correctAnswer: string;
  reference: string;
}

export interface IQuizDaily extends Document {
  date: string; // YYYY-MM-DD
  questions: IQuizDailyQuestion[];
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quizDailyQuestionSchema = new Schema<IQuizDailyQuestion>(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length === 4,
        message: "Each question must have exactly 4 options"
      }
    },
    correctAnswer: { type: String, required: true },
    reference: { type: String, required: true }
  },
  { _id: false }
);

const quizDailySchema = new Schema<IQuizDaily>(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true
    },

    questions: {
      type: [quizDailyQuestionSchema],
      required: true
    },

    locked: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

export const QuizDaily = mongoose.model<IQuizDaily>(
  "QuizDaily",
  quizDailySchema
);