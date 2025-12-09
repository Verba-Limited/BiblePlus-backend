import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

interface DecodedToken {
  userId: string;
  role: string; // "user" | "admin"
  iat: number;
  exp: number;
}

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No authorization token provided",
    });
  }

  const token = header.split(" ")[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as DecodedToken;

    // Attach to request
    // @ts-ignore
    req.userId = decoded.userId;

    // @ts-ignore
    req.userRole = decoded.role;

    return next();
  } catch (err: any) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

export default authMiddleware;
