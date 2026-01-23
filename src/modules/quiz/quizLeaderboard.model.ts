import mongoose from "mongoose";

const quizLeaderboardSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    username: { type: String }, // optional (cache)
    avatar: { type: String },

    totalScore: { type: Number, default: 0 },
    totalCorrect: { type: Number, default: 0 },
    totalPlayed: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const QuizLeaderboard = mongoose.model(
  "QuizLeaderboard",
  quizLeaderboardSchema
);