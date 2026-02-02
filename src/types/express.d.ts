// src/types/express.d.ts
import "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: "user" | "admin";
      user?: {
        _id: string;
        email: string;
        username?: string;
        firstName?: string;
        lastName?: string;
        role?: "user" | "admin";
      };
    }
  }
}

export {};