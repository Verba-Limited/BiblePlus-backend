import mongoose, { Schema, Document } from "mongoose";

export interface IQuizLeaderboard extends Document {
  userId: string;
  username?: string;
  avatar?: string;

  type: "global" | "daily";
  date?: string;

  totalScore: number;
  totalCorrect: number;
  totalPlayed: number;
}

const quizLeaderboardSchema = new Schema<IQuizLeaderboard>(
  {
    userId: { type: String, required: true, index: true },
    username: { type: String },
    avatar: { type: String },

    type: {
      type: String,
      enum: ["global", "daily"],
      default: "global",
      index: true
    },

    date: {
      type: String, // YYYY-MM-DD
      index: true
    },

    totalScore: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalPlayed: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Prevent duplicate rows
quizLeaderboardSchema.index(
  { userId: 1, type: 1, date: 1 },
  { unique: true, sparse: true }
);

export const QuizLeaderboard = mongoose.model<IQuizLeaderboard>(
  "QuizLeaderboard",
  quizLeaderboardSchema
);