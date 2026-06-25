import { Resend } from "resend";

if (!process.env.RESEND_API_KEY) {
  console.warn("⚠️  RESEND_API_KEY is missing — email features will be disabled");
}

export const resend = new Resend(process.env.RESEND_API_KEY || "");
export const FROM_EMAIL = `BiblePlus <noreply@${process.env.RESEND_FROM_DOMAIN || "yourdomain.com"}>`;