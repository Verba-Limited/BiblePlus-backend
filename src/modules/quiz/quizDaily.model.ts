import mongoose, { Schema, Document } from "mongoose";

export interface IQuizDailyQuestion {
  id: number;
  passage: string;
  options: string[];
  correctAnswer: string;
  hint: string;
}

export interface IQuizDaily extends Document {
  date: string;
  questions: IQuizDailyQuestion[];
  locked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const quizDailyQuestionSchema = new Schema<IQuizDailyQuestion>(
  {
    id: { type: Number, required: true },
    passage: { type: String, required: true },
    options: {
      type: [String],
      required: true,
      validate: {
        validator: (arr: string[]) => arr.length === 3,
        message: "Each question must have exactly 3 options"
      }
    },
    correctAnswer: { type: String, required: true },
    hint: { type: String, required: true }
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

export const QuizDaily = mongoose.model<IQuizDaily>("QuizDaily", quizDailySchema);