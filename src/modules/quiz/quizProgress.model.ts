import mongoose, { Schema, Document, Types } from "mongoose";

export interface IQuizProgress extends Document {
  userId: Types.ObjectId;

  highestLevel: number;

  totalXp: number;
  totalCorrect: number;
  totalAttempts: number;

  weeklyXp: number;
  weeklyCorrect: number;
  weeklyAttempts: number;

  lastWeeklyReset: string; // YYYY-WW format
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

    highestLevel: { type: Number, default: 1 },

    totalXp: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalAttempts: { type: Number, default: 0 },

    weeklyXp: { type: Number, default: 0 },
    weeklyCorrect: { type: Number, default: 0 },
    weeklyAttempts: { type: Number, default: 0 },

    lastWeeklyReset: { type: String, default: "" }
  },
  { timestamps: true }
);

quizProgressSchema.index({ weeklyXp: -1 });

export const QuizProgress = mongoose.model<IQuizProgress>(
  "QuizProgress",
  quizProgressSchema
);