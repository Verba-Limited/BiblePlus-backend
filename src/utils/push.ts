import axios from "axios";
import AppError from "../core/AppError";

const ONE_SIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
const ONE_SIGNAL_API_KEY = process.env.ONESIGNAL_API_KEY;

export const sendPushToUser = async (
  userId: string,
  title: string,
  message: string
) => {
  if (!ONE_SIGNAL_APP_ID || !ONE_SIGNAL_API_KEY) {
    throw new AppError("OneSignal not configured", 500);
  }

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

export const sendPushToAll = async (
  title: string,
  message: string
) => {
  if (!ONE_SIGNAL_APP_ID || !ONE_SIGNAL_API_KEY) {
    throw new AppError("OneSignal not configured", 500);
  }

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