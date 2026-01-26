import { Request, Response, NextFunction } from "express";

/* =====================================================
   ADMIN-ONLY MIDDLEWARE
   REQUIREMENTS:
   - authMiddleware MUST run before this
   - authMiddleware must attach:
       req.userId
       req.userRole
===================================================== */

export const adminOnly = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // authMiddleware attaches this
  const userRole = (req as any).userRole;

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

  // ✅ Authorized admin
  return next();
};