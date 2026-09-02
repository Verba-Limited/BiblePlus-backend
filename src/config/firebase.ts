import * as admin from "firebase-admin";

/* =====================================================
   FIREBASE ADMIN INIT

   A service-account JSON blob does not survive being pasted
   into a .env file across multiple raw lines — dotenv reads
   only the first line, so the value arrives as "{" and the
   parse fails. Accept a base64-encoded value too, which is
   single-line and the usual way to carry this in an env var.

     FIREBASE_SERVICE_ACCOUNT_B64=$(base64 -i service-account.json)
===================================================== */

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
const rawB64 = process.env.FIREBASE_SERVICE_ACCOUNT_B64;

const parseServiceAccount = (): admin.ServiceAccount | null => {
  // Preferred: base64, single line, safe in any .env
  if (rawB64) {
    try {
      return JSON.parse(Buffer.from(rawB64, "base64").toString("utf8"));
    } catch (err) {
      console.error(
        "❌ FIREBASE_SERVICE_ACCOUNT_B64 is not valid base64-encoded JSON —",
        (err as Error).message
      );
      return null;
    }
  }

  if (!raw) {
    console.warn(
      "⚠️  FIREBASE_SERVICE_ACCOUNT is missing — push notifications are disabled"
    );
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch (err) {
    // Name the actual cause instead of dumping a bare SyntaxError
    const looksTruncated = raw.trim().length < 50;

    console.error(
      looksTruncated
        ? `❌ FIREBASE_SERVICE_ACCOUNT is truncated (got ${raw.length} character(s): ${JSON.stringify(
            raw.slice(0, 20)
          )}).\n` +
            "   A multi-line JSON blob in .env is read only up to the first newline.\n" +
            "   Fix: put the JSON on ONE line in single quotes, or set FIREBASE_SERVICE_ACCOUNT_B64 to its base64 form.\n" +
            "   Push notifications are disabled until this is corrected."
        : `❌ Failed to parse FIREBASE_SERVICE_ACCOUNT: ${(err as Error).message}\n` +
            "   Push notifications are disabled until this is corrected."
    );
    return null;
  }
};

const serviceAccount = parseServiceAccount();

if (serviceAccount && !admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("✅ Firebase Admin initialised — push notifications enabled");
  } catch (err) {
    console.error("❌ Firebase Admin failed to initialise:", (err as Error).message);
  }
}

/** True when push can actually be delivered. */
export const isFirebaseReady = () => admin.apps.length > 0;

export default admin;
