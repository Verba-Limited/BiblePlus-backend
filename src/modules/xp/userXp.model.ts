import mongoose, { Schema, Document } from "mongoose";

export interface IUserXp extends Document {
  user: mongoose.Types.ObjectId;
  totalXp: number;
  weeklyXp: number;
  weeklyCorrect: number;
  weeklyAttempts: number;
  level: number;
  lastWeeklyReset: Date;
}

const userXpSchema = new Schema<IUserXp>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },
    totalXp: { type: Number, default: 0 },
    weeklyXp: { type: Number, default: 0 },
    weeklyCorrect: { type: Number, default: 0 },
    weeklyAttempts: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    lastWeeklyReset: { type: Date }
  },
  { timestamps: true }
);

export const UserXp = mongoose.model<IUserXp>(
  "UserXp",
  userXpSchema
);