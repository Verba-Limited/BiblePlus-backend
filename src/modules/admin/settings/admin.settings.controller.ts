import { Request, Response, NextFunction } from "express";
import AppError from "../../../core/AppError";
import { Admin } from "../admin.model";
import { hashPassword, comparePassword } from "../../../utils/bycrypt";
import { EmailService } from "../../../services/email.service";

export const AdminSettingsController = {
  /* =====================================================
     REQUEST OTP FOR PASSWORD CHANGE
  ===================================================== */
  requestPasswordOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const adminId = req.userId;
      if (!adminId) throw new AppError("Unauthorized", 401);

      const admin = await Admin.findById(adminId);
      if (!admin) throw new AppError("Admin not found", 404);
      if (!admin.email) throw new AppError("Admin email not configured. Cannot send OTP.", 400);

      // Generate 6 digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Expire in 10 minutes
      const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

      admin.otp = otp;
      admin.otpExpiresAt = otpExpiresAt;
      await admin.save();

      // Send Email
      await EmailService.sendAdminOtp(admin.email, admin.username, otp);

      res.status(200).json({
        success: true,
        message: "OTP sent to your email successfully"
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     CHANGE PASSWORD (VERIFY OTP)
  ===================================================== */
  changePassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { oldPassword, newPassword, otp } = req.body;
      const adminId = req.userId; // Provided by authMiddleware

      if (!adminId) {
        throw new AppError("Unauthorized", 401);
      }

      if (!oldPassword || !newPassword || !otp) {
        throw new AppError("oldPassword, newPassword, and otp are required", 400);
      }

      const admin = await Admin.findById(adminId);
      if (!admin) {
        throw new AppError("Admin not found", 404);
      }

      // 1. Verify old password
      const isValid = await comparePassword(oldPassword, admin.password);
      if (!isValid) {
        throw new AppError("Incorrect old password", 401);
      }

      // 2. Verify OTP
      if (!admin.otp || !admin.otpExpiresAt) {
        throw new AppError("No OTP was requested. Please request an OTP first.", 400);
      }

      if (new Date() > admin.otpExpiresAt) {
        throw new AppError("OTP has expired. Please request a new one.", 400);
      }

      if (admin.otp !== otp) {
        throw new AppError("Invalid OTP", 401);
      }

      if (newPassword.length < 6) {
        throw new AppError("New password must be at least 6 characters long", 400);
      }

      // 3. Update password and clear OTP
      const hashed = await hashPassword(newPassword);
      admin.password = hashed;
      admin.otp = undefined;
      admin.otpExpiresAt = undefined;
      await admin.save();

      res.status(200).json({
        success: true,
        message: "Password changed successfully"
      });
    } catch (err) {
      next(err);
    }
  }
};
