// src/middleware/admin.middleware.ts
import { Request, Response, NextFunction } from "express";

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  // authMiddleware already ran
  // @ts-ignore
  const role = req.userRole;

  if (role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }

  next();
};