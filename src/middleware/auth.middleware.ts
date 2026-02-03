// src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from "express";
import AppError from "../core/AppError";
import { verifyAccessToken } from "../utils/jwt";

/* =====================================================
   EXTEND EXPRESS REQUEST (TYPE-SAFE)
===================================================== */
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: "user" | "admin";
    }
  }
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

  try {
    const decoded = verifyAccessToken(token);

    /* ---------------------------------------------
       ATTACH IDENTITY TO REQUEST
    ---------------------------------------------- */
    req.userId = decoded.userId;
    req.userRole = decoded.role;

    return next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message:
        error instanceof AppError
          ? error.message
          : "Invalid or expired token",
    });
  }
};

export default authMiddleware;