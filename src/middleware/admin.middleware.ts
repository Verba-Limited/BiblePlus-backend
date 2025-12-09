import { Request, Response, NextFunction } from "express";
import AppError from "../core/AppError";

export const adminOnly = (req: Request, res: Response, next: NextFunction) => {
  // @ts-ignore
  if (req.userRole !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Wetin concern you with Admin matter?",
    });
  }

  next();
};
