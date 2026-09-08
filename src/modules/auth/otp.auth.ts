import mongoose, { Schema, Document } from "mongoose";

/* =====================================================
   ONE-TIME PASSCODES

   `purpose` scopes a code to the flow that issued it.
   Without it, every OTP for an address was interchangeable:
   a signup verification code could be used to reset the
   password, and a reset code could verify an account.
===================================================== */

export type OtpPurpose = "verification" | "password-reset";

export interface IOtp extends Document {
  email: string;
  code: string;
  purpose: OtpPurpose;
  expiresAt: Date;
}

const otpSchema = new Schema<IOtp>(
  {
    email: { type: String, required: true, index: true },
    code: { type: String, required: true },
    purpose: {
      type: String,
      enum: ["verification", "password-reset"],
      default: "verification",
      index: true
    },
    expiresAt: { type: Date, required: true }
  },
  { timestamps: true }
);

// Lookups are always email + code + purpose
otpSchema.index({ email: 1, code: 1, purpose: 1 });

// Let Mongo clear expired codes on its own
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export const Otp = mongoose.model<IOtp>("Otp", otpSchema);
