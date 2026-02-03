// src/modules/quiz/quizAttempt.model.ts
import mongoose, { Schema, Document } from "mongoose";

export interface IQuizAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  mode: "normal" | "puzzle" | "daily";
  level?: number;
  score: number;
  correct: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

const quizAttemptSchema = new Schema<IQuizAttempt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    mode: {
      type: String,
      enum: ["normal", "puzzle", "daily"],
      required: true,
      index: true
    },

    // Only for normal & puzzle quizzes
   level: {
  type: Number,
  min: 1,
  max: 10,
  required: function (this: IQuizAttempt): boolean {
    return this.mode !== "daily";
  }
},

    score: {
      type: Number,
      min: 0,
      max: 100,
      required: true
    },

    correct: {
      type: Number,
      min: 0,
      required: true
    },

    total: {
      type: Number,
      min: 1,
      required: true
    }
  },
  {
    timestamps: true
  }
);

/* ============================
   INDEXES (SAFE)
============================ */

// Fast leaderboard aggregation
quizAttemptSchema.index({ mode: 1, score: -1 });

// User history lookups
quizAttemptSchema.index({ userId: 1, createdAt: -1 });

export const QuizAttempt = mongoose.model<IQuizAttempt>(
  "QuizAttempt",
  quizAttemptSchema
);