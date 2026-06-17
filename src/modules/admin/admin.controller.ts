// src/modules/admin/admin.controller.ts
import { Request, Response, NextFunction } from "express";
import { AdminService } from "./admin.service";
import AppError from "../../core/AppError";

export const AdminController = {
  // -----------------------------------------------------
  // ADMIN LOGIN
  // -----------------------------------------------------
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Allow them to pass either `username` or `email` field
      const identifier = req.body.username || req.body.email;
      const { password } = req.body;

      if (!identifier || !password) {
        throw new AppError("username/email and password are required", 400);
      }

      /**
       * AdminService.login MUST:
       *  - validate credentials
       *  - return { userId, role: "admin", token }
       */
      const result = await AdminService.login(identifier, password);

      res.status(200).json({
        success: true,
        message: "Admin login successful",
        data: {
          accessToken: result.token,
          user: {
            id: result.admin.id,
            username: result.admin.username,
            role: result.admin.role
          }
        }
      });
    } catch (err) {
      next(err);
    }
  }
};