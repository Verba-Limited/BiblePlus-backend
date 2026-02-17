// src/modules/quiz/quizProgress.model.ts

import mongoose, { Schema, Document } from "mongoose";

export interface IQuizProgress extends Document {
  userId: mongoose.Types.ObjectId;
  highestLevel: number;
}

const quizProgressSchema = new Schema<IQuizProgress>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true
  },
  highestLevel: {
    type: Number,
    default: 1
  }
});

export const QuizProgress = mongoose.model<IQuizProgress>(
  "QuizProgress",
  quizProgressSchema
);