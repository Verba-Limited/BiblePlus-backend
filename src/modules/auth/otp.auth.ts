import mongoose, { Schema, Document } from "mongoose";

export interface IOtp extends Document {
  email: string;
  code: string;
  expiresAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true },
    code: { type: String, required: true },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

export const Otp = mongoose.model<IOtp>("Otp", otpSchema);
