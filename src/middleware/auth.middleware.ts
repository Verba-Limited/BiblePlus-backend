import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
    });
  }

  const token = header.split(" ")[1];

  try {
    const decoded: any = jwt.verify(token, process.env.JWT_SECRET!);

    // Attach user ID to request
    // @ts-ignore
    req.userId = decoded.userId;

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
