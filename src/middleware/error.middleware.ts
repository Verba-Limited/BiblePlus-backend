import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  console.error("🔥 ERROR:", err);

  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
};
