import jwt from "jsonwebtoken";

interface AccessTokenPayload {
  userId: string;
  role: "user" | "admin";
  username: string;
  avatar?: string;
}

export const generateAccessToken = (payload: AccessTokenPayload) => {
  return jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d", 
  });
};

export const generateRefreshToken = (userId: string) => {
  return jwt.sign(
    { userId },
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "30d" }
  );
};