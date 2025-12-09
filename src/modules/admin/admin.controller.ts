import { Request, Response, NextFunction } from "express";
import { AdminService } from "./admin.service";

export const AdminController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, password } = req.body;

      const result = await AdminService.login(username, password);

      res.json({
        success: true,
        message: "Admin login successful",
        data: result
      });
    } catch (err) {
      next(err);
    }
  }
};
