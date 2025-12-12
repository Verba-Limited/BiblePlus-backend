import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Admin token required",
    });
  }

  const token = header.split(" ")[1];

  try {
    if (!process.env.JWT_ADMIN_SECRET) {
      console.error("❌ ERROR: JWT_ADMIN_SECRET is missing in .env");
      return res.status(500).json({
        success: false,
        message: "Server config error (missing admin secret)"
      });
    }

    // Verify with admin secret
    const decoded: any = jwt.verify(token, process.env.JWT_ADMIN_SECRET);

    if (!decoded || decoded.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not an admin",
      });
    }

    // Attach admin info
    // @ts-ignore
    req.adminId = decoded.adminId;
    // @ts-ignore
    req.userRole = "admin";

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired admin token",
    });
  }
};
