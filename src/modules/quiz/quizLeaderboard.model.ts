import mongoose, { Schema, Document } from "mongoose";

export interface IQuizLeaderboard extends Document {
  userId: string;
  username?: string;
  avatar?: string;

  type: "global" | "daily" | "weekly" | "monthly";
  date?: string;        // YYYY-MM-DD (daily)
  week?: string;        // YYYY-WW (weekly)
  month?: string;       // YYYY-MM (monthly)

  totalScore: number;
  totalCorrect: number;
  totalPlayed: number;
}

const quizLeaderboardSchema = new Schema<IQuizLeaderboard>(
  {
    userId: { type: String, required: true },

    username: { type: String },
    avatar: { type: String },

    type: {
      type: String,
      enum: ["global", "daily", "weekly", "monthly"],
      required: true
    },

    date: { type: String },   // daily
    week: { type: String },   // weekly
    month: { type: String },  // monthly

    totalScore: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalPlayed: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Prevent duplicates per period
quizLeaderboardSchema.index(
  { userId: 1, type: 1, date: 1, week: 1, month: 1 },
  { unique: true }
);

export const QuizLeaderboard = mongoose.model(
  "QuizLeaderboard",
  quizLeaderboardSchema
);