import { Request, Response, NextFunction } from "express";
import { Admin } from "../admin.model";
import AppError from "../../../core/AppError";
import { hashPassword } from "../../../utils/bycrypt";

export const AdminManagementController = {
  /* =====================================================
     CREATE NEW ADMIN (SUPERADMIN ONLY)
  ===================================================== */
  createAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { username, email, password, role } = req.body;

      if (!username || !email || !password || !role) {
        throw new AppError("username, email, password, and role are required", 400);
      }

      if (!["editor", "moderator"].includes(role)) {
        throw new AppError("Role must be either 'editor' or 'moderator'", 400);
      }

      // Check if username or email exists
      const existingUser = await Admin.findOne({
        $or: [{ username }, { email }]
      });

      if (existingUser) {
        throw new AppError("An admin with this username or email already exists", 409);
      }

      const hashedPassword = await hashPassword(password);

      const newAdmin = await Admin.create({
        username,
        email,
        password: hashedPassword,
        role
      });

      res.status(201).json({
        success: true,
        message: `${role} account created successfully`,
        data: {
          user: {
            id: newAdmin._id,
            username: newAdmin.username,
            email: newAdmin.email,
            role: newAdmin.role
          }
        }
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     LIST ALL ADMINS
  ===================================================== */
  listAdmins: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const admins = await Admin.find().select("-password -otp -otpExpiresAt").sort({ createdAt: -1 });

      res.status(200).json({
        success: true,
        data: admins
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     DELETE ADMIN
  ===================================================== */
  deleteAdmin: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const admin = await Admin.findById(id);
      if (!admin) {
        throw new AppError("Admin not found", 404);
      }

      if (admin.role === "superadmin") {
        throw new AppError("Cannot delete a superadmin account", 403);
      }

      await Admin.findByIdAndDelete(id);

      res.status(200).json({
        success: true,
        message: "Admin account deleted successfully"
      });
    } catch (err) {
      next(err);
    }
  }
};
