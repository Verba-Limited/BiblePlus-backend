// src/middleware/admin.middleware.ts

import { Request, Response, NextFunction } from "express";

/**
 * Admin-only access middleware
 * 
 * REQUIREMENTS:
 * - authMiddleware MUST run before this
 * - authMiddleware must attach:
 *    req.userId
 *    req.userRole
 */
export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // authMiddleware should have attached this
  // @ts-ignore
  const userRole = req.userRole;

  if (!userRole) {
    return res.status(401).json({
      success: false,
      message: "Authentication required",
    });
  }

  if (userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }

  return next();
};