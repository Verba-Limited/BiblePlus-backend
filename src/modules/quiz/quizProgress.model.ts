import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuizProgress extends Document {
  userId: Types.ObjectId;

  highestLevel: number;

  totalXp: number;
  totalCorrect: number;
  totalAttempts: number;

  createdAt: Date;
  updatedAt: Date;
}

const quizProgressSchema = new Schema<IQuizProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    highestLevel: {
      type: Number,
      default: 1
    },

    totalXp: {
      type: Number,
      default: 0
    },

    totalCorrect: {
      type: Number,
      default: 0
    },

    totalAttempts: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

quizProgressSchema.index({ totalXp: -1 });

export const QuizProgress = mongoose.model<IQuizProgress>(
  "QuizProgress",
  quizProgressSchema
);