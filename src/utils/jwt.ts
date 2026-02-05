import jwt, { SignOptions } from "jsonwebtoken";
import AppError from "../core/AppError";

/* =====================================================
   ENV VALIDATION
===================================================== */
const JWT_SECRET = process.env.JWT_SECRET;
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET;

if (!JWT_SECRET || !JWT_REFRESH_SECRET) {
  throw new Error("JWT secrets are not defined in environment variables");
}

/* =====================================================
   TYPES
===================================================== */
export interface AccessTokenPayload {
  userId: string;
  role: "user" | "admin";
}

/* =====================================================
   CONFIG
===================================================== */
const ACCESS_TOKEN_EXPIRES_IN = "15m"; // 🔐 short-lived
const REFRESH_TOKEN_EXPIRES_IN = "30d";

const ISSUER = "bibleplus-api";
const AUDIENCE = "bibleplus-client";

/* =====================================================
   GENERATE ACCESS TOKEN
===================================================== */
export const generateAccessToken = (
  payload: AccessTokenPayload
) => {
  const options: SignOptions = {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    issuer: ISSUER,
    audience: AUDIENCE
  };

  return jwt.sign(payload, JWT_SECRET, options);
};

/* =====================================================
   GENERATE REFRESH TOKEN
===================================================== */
export const generateRefreshToken = (userId: string) => {
  const options: SignOptions = {
    expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    issuer: ISSUER,
    audience: AUDIENCE
  };

  return jwt.sign({ userId }, JWT_REFRESH_SECRET, options);
};

/* =====================================================
   VERIFY ACCESS TOKEN
===================================================== */
export const verifyAccessToken = (
  token: string
): AccessTokenPayload => {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE
    }) as AccessTokenPayload;

    if (!decoded.userId || !decoded.role) {
      throw new AppError("Invalid token payload", 401);
    }

    return decoded;
  } catch {
    throw new AppError("Invalid or expired access token", 401);
  }
};

/* =====================================================
   VERIFY REFRESH TOKEN
===================================================== */
export const verifyRefreshToken = (token: string) => {
  try {
    return jwt.verify(token, JWT_REFRESH_SECRET, {
      issuer: ISSUER,
      audience: AUDIENCE
    }) as { userId: string };
  } catch {
    throw new AppError("Invalid or expired refresh token", 401);
  }
};