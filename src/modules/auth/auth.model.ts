import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  email: string;
  password: string;
  name?: string;
  avatar?: string;
  verified: boolean;
}

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String },
    avatar: { type: String },
    verified: { type: Boolean, default: false }
  },
  { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);
