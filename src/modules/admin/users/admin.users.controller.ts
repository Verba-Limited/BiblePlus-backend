import { Request, Response, NextFunction } from "express";
import AppError from "../../../core/AppError";
import { User } from "../../auth/auth.model";
import { hashPassword } from "../../../utils/bycrypt";

export const AdminUsersController = {
  getAllUsers: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const search = (req.query.search as string) || "";

      let query: any = {};
      if (search) {
        query = {
          $or: [
            { email: { $regex: search, $options: "i" } },
            { username: { $regex: search, $options: "i" } },
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } }
          ]
        };
      }

      const users = await User.find(query)
        .select("-password") // Do not return passwords
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const total = await User.countDocuments(query);

      res.status(200).json({
        success: true,
        data: {
          users,
          total,
          page,
          pages: Math.ceil(total / limit)
        }
      });
    } catch (err) {
      next(err);
    }
  },

  getUserById: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.params.id).select("-password");
      if (!user) {
        throw new AppError("User not found", 404);
      }
      res.status(200).json({ success: true, data: user });
    } catch (err) {
      next(err);
    }
  },

  resetUserPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { newPassword } = req.body;
      const targetPassword = newPassword || "Password123!"; // Default fallback

      const user = await User.findById(req.params.id);
      if (!user) {
        throw new AppError("User not found", 404);
      }

      if (targetPassword.length < 6) {
        throw new AppError("Password must be at least 6 characters long", 400);
      }

      const hashed = await hashPassword(targetPassword);
      user.password = hashed;
      await user.save();

      res.status(200).json({
        success: true,
        message: "User password has been reset successfully",
        data: {
          temporaryPassword: targetPassword
        }
      });
    } catch (err) {
      next(err);
    }
  },

  banUser: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new AppError("User not found", 404);
      }
      user.isDeleted = true;
      await user.save();

      res.status(200).json({
        success: true,
        message: "User has been banned/deleted"
      });
    } catch (err) {
      next(err);
    }
  }
};
