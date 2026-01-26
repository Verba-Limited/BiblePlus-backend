import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import AppError from "../core/AppError";

/* =====================================================
   TOKEN PAYLOAD SHAPE
===================================================== */
interface DecodedToken extends JwtPayload {
  userId: string;
  role: "user" | "admin";
}

/* =====================================================
   AUTH MIDDLEWARE
===================================================== */
const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Authorization token missing",
    });
  }

  const token = authHeader.split(" ")[1];

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      success: false,
      message: "Server misconfiguration (JWT secret missing)",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    ) as DecodedToken;

    if (!decoded.userId || !decoded.role) {
      throw new AppError("Invalid token payload", 401);
    }

    /* ---------------------------------------------
       ATTACH TO REQUEST (STANDARDIZED)
    ---------------------------------------------- */
    // @ts-ignore
    req.userId = decoded.userId;

    // @ts-ignore
    req.userRole = decoded.role;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;