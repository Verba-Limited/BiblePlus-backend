// src/modules/quiz/quizDaily.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IQuizDaily extends Document {
  date: string; // YYYY-MM-DD
  questions: mongoose.Types.ObjectId[];
}

const quizDailySchema = new Schema<IQuizDaily>(
  {
    date: {
      type: String,
      required: true,
      unique: true,
      index: true 
    },

    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: "QuizQuestion",
        required: true
      }
    ]
  },
  {
    timestamps: true
  }
);

/* ============================
   SAFETY INDEX
============================ */
quizDailySchema.index({ date: 1 }, { unique: true });

export const QuizDaily = mongoose.model<IQuizDaily>(
  "QuizDaily",
  quizDailySchema
);