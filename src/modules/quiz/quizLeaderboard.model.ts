import mongoose, { Schema, Document } from "mongoose";

export interface IQuizLeaderboard extends Document {
  userId: string;
  type: "global" | "daily" | "weekly" | "monthly";

  date?: string;   // YYYY-MM-DD
  week?: string;   // 2026-W05
  month?: string;  // 2026-01

  username: string;
  avatar?: string;

  totalScore: number;
  totalCorrect: number;
  totalPlayed: number;
}

const quizLeaderboardSchema = new Schema<IQuizLeaderboard>(
  {
    userId: { type: String, required: true, index: true },

    type: {
      type: String,
      enum: ["global", "daily", "weekly", "monthly"],
      required: true,
      index: true
    },

    date: { type: String },
    week: { type: String },
    month: { type: String },

    username: { type: String, required: true },
    avatar: { type: String },

    totalScore: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalPlayed: { type: Number, default: 0 }
  },
  { timestamps: true }
);

/**
 * 🔐 VERY IMPORTANT
 * This allows:
 *  - ONE row per user per leaderboard scope
 *  - BUT many users per leaderboard
 */
quizLeaderboardSchema.index(
  { userId: 1, type: 1, date: 1, week: 1, month: 1 },
  { unique: true }
);

export const QuizLeaderboard = mongoose.model<IQuizLeaderboard>(
  "QuizLeaderboard",
  quizLeaderboardSchema
);