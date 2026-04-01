import { messaging } from "../config/firebase";
import { User } from "../modules/auth/auth.model";

export const PushService = {

  /* =====================================================
     SEND TO SINGLE USER
  ===================================================== */
  async sendToUser(userId: string, title: string, body: string, data?: any) {
    try {
      const user = await User.findById(userId).select("fcmToken");
      if (!user?.fcmToken) return;

      await messaging.send({
        token: user.fcmToken,
        notification: { title, body },
        data: data ? Object.fromEntries(
          Object.entries(data).map(([k, v]) => [k, String(v)])
        ) : {},
        android: {
          priority: "high",
          notification: { sound: "default", clickAction: "FLUTTER_NOTIFICATION_CLICK" }
        },
        apns: {
          payload: { aps: { sound: "default", badge: 1 } }
        }
      });

      console.log(`✅ Push sent to user ${userId}`);
    } catch (error: any) {
      // ✅ Remove invalid token
      if (error.code === "messaging/invalid-registration-token" ||
          error.code === "messaging/registration-token-not-registered") {
        await User.findByIdAndUpdate(userId, { $unset: { fcmToken: 1 } });
      }
      console.error(`❌ Push failed for user ${userId}:`, error.message);
    }
  },

  /* =====================================================
     SEND TO ALL USERS
  ===================================================== */
  async sendToAll(title: string, body: string, data?: any) {
    try {
      const users = await User.find({
        fcmToken: { $exists: true, $ne: "" }
      }).select("fcmToken");

      if (users.length === 0) return;

      const tokens = users.map(u => u.fcmToken).filter(Boolean) as string[];

      // ✅ FCM supports max 500 tokens per multicast
      const BATCH_SIZE = 500;
      for (let i = 0; i < tokens.length; i += BATCH_SIZE) {
        const batch = tokens.slice(i, i + BATCH_SIZE);

        await messaging.sendEachForMulticast({
          tokens: batch,
          notification: { title, body },
          data: data ? Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, String(v)])
          ) : {},
          android: {
            priority: "high",
            notification: { sound: "default" }
          },
          apns: {
            payload: { aps: { sound: "default", badge: 1 } }
          }
        });
      }

      console.log(`✅ Push sent to ${tokens.length} devices`);
    } catch (error) {
      console.error("❌ Broadcast push failed:", error);
    }
  }
};