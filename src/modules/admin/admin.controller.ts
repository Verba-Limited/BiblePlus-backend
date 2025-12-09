import { Request, Response, NextFunction } from "express";
import { AdminService } from "./admin.service";
import AppError from "../../core/AppError";

export const AdminController = {
  // -----------------------------------------------------
  // ADMIN LOGIN
  // -----------------------------------------------------
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;

      // Validate input
      if (!username || !password) {
        throw new AppError("Username and password are required", 400);
      }

      // Authenticate
      const result = await AdminService.login(username, password);

      res.status(200).json({
        success: true,
        message: "Admin login successful",
        token: result.token
      });
    } catch (err) {
      next(err);
    }
  }
};
