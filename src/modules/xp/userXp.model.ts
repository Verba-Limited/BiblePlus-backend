import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUserXp extends Document {
  user: Types.ObjectId;
  totalXp: number;
  level: number;
  createdAt: Date;
  updatedAt: Date;
}

const userXpSchema = new Schema<IUserXp>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true
    },

    totalXp: {
      type: Number,
      default: 0
    },

    level: {
      type: Number,
      default: 1
    }
  },
  { timestamps: true }
);

export const UserXp = mongoose.model<IUserXp>(
  "UserXp",
  userXpSchema
);