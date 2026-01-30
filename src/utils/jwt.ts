import jwt from "jsonwebtoken";

interface JwtPayload {
  userId: string;
  role: string; // "user" | "admin"
}

// ACCESS TOKEN (short-lived)
export const generateAccessToken = (userId: string, role: string = "user") => {
  return jwt.sign(
    { userId, role } as JwtPayload,
    process.env.JWT_SECRET!,
    { expiresIn: "30m" }
  );
};

// REFRESH TOKEN (long-lived)
export const generateRefreshToken = (userId: string, role: string = "user") => {
  return jwt.sign(
    { userId, role } as JwtPayload,
    process.env.JWT_REFRESH_SECRET!,
    { expiresIn: "7d" }
  );
};
