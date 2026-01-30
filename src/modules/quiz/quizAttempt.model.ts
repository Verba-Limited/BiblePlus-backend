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

    // Only required for non-daily quizzes
    level: {
      type: Number,
      min: 1,
      max: 10,
      required: function () {
        // `this` is the document
        // daily quizzes do NOT have levels
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const self = this as IQuizAttempt;
        return self.mode !== "daily";
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
   INDEXES (CRITICAL)
============================ */

// Prevent duplicate daily attempts
quizAttemptSchema.index(
  { userId: 1, mode: 1, createdAt: 1 },
  { name: "quiz_attempt_user_mode_date" }
);

// Fast leaderboard queries
quizAttemptSchema.index({ mode: 1, score: -1 });

export const QuizAttempt = mongoose.model<IQuizAttempt>(
  "QuizAttempt",
  quizAttemptSchema
);