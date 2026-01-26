// src/middleware/admin.middleware.ts
import { Request, Response, NextFunction } from "express";

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  // authMiddleware MUST run first
  // @ts-ignore
  const role = req.userRole;

  if (!role) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }

  return next();
};