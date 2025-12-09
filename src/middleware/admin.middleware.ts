import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import AppError from "../core/AppError";

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
    // Verify admin JWT
    const decoded: any = jwt.verify(token, process.env.JWT_ADMIN_SECRET!);

    // Must contain role + adminId
    if (!decoded || decoded.role !== "admin" || !decoded.adminId) {
      return res.status(403).json({
        success: false,
        message: "You no be Admin. Shift one side 😭",
      });
    }

    // Attach admin info to request object
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
