import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  throw new Error("RESEND_API_KEY is missing from .env");
}

export const resend = new Resend(process.env.RESEND_API_KEY);
export const FROM_EMAIL = "BiblePlus <noreply@yourdomain.com>"; // ✅ replace with your domain