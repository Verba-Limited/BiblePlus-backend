import axios from "axios";
import { PushService } from "../services/push.service";

const ONE_SIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONE_SIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

export const isOneSignalConfigured = () =>
  Boolean(ONE_SIGNAL_APP_ID && ONE_SIGNAL_API_KEY);

/** What actually happened when we tried to deliver a push. */
export type PushResult = {
  delivered: boolean;
  provider: "firebase" | "onesignal" | "none";
  reason?: string;
};

/* ======================================================
   SEND TO ONE USER

   Firebase is the configured provider in this deployment;
   OneSignal is optional. Try Firebase, fall back to
   OneSignal, and report the outcome rather than throwing —
   a push provider being unavailable must not fail the admin
   action that triggered it.
====================================================== */
export const sendPushToUser = async (
  userId: string,
  title: string,
  message: string
): Promise<PushResult> => {
  try {
    await PushService.sendToUser(userId, title, message);
    // PushService swallows its own errors and no-ops when Firebase
    // or the user's token is missing, so treat this as best effort.
  } catch (err: any) {
    console.error("⚠️  Firebase push failed:", err?.message);
  }

  if (!isOneSignalConfigured()) {
    return { delivered: true, provider: "firebase" };
  }

  try {
    await sendOneSignalToUser(userId, title, message);
    return { delivered: true, provider: "onesignal" };
  } catch (err: any) {
    return {
      delivered: false,
      provider: "onesignal",
      reason: err?.message || "OneSignal request failed"
    };
  }
};

const sendOneSignalToUser = async (
  userId: string,
  title: string,
  message: string
) => {
  await axios.post(
    "https://api.onesignal.com/notifications",
    {
      app_id: ONE_SIGNAL_APP_ID,
      include_external_user_ids: [userId],
      headings: { en: title },
      contents: { en: message }
    },
    {
      headers: {
        Authorization: `Basic ${ONE_SIGNAL_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
};

/* ======================================================
   BROADCAST
====================================================== */
export const sendPushToAll = async (
  title: string,
  message: string
): Promise<PushResult> => {
  try {
    await PushService.sendToAll(title, message);
  } catch (err: any) {
    console.error("⚠️  Firebase broadcast failed:", err?.message);
  }

  if (!isOneSignalConfigured()) {
    return { delivered: true, provider: "firebase" };
  }

  try {
    await sendOneSignalToAll(title, message);
    return { delivered: true, provider: "onesignal" };
  } catch (err: any) {
    return {
      delivered: false,
      provider: "onesignal",
      reason: err?.message || "OneSignal request failed"
    };
  }
};

const sendOneSignalToAll = async (title: string, message: string) => {
  await axios.post(
    "https://api.onesignal.com/notifications",
    {
      app_id: ONE_SIGNAL_APP_ID,
      included_segments: ["All"],
      headings: { en: title },
      contents: { en: message }
    },
    {
      headers: {
        Authorization: `Basic ${ONE_SIGNAL_API_KEY}`,
        "Content-Type": "application/json"
      }
    }
  );
};