import mongoose, { Schema, Document } from "mongoose";

export interface IDailyQuizAttempt extends Document {
  userId: string;
  date: string; // YYYY-MM-DD
  answers: any[];
  createdAt: Date;
}

const dailyQuizAttemptSchema = new Schema<IDailyQuizAttempt>(
  {
    userId: { type: String, required: true, index: true },
    date: { type: String, required: true }, // Example: "2025-12-12"
    answers: { type: [Schema.Types.Mixed as any], default: [] }
  },
  { timestamps: true }
);

// Prevent multiple submissions per day
dailyQuizAttemptSchema.index({ userId: 1, date: 1 }, { unique: true });

export const QuizAttempt = mongoose.model<IDailyQuizAttempt>(
  "QuizAttempt",
  dailyQuizAttemptSchema
);
