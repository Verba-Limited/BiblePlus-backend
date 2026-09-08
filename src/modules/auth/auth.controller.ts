import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";
import AppError from "../../core/AppError";

export const AuthController = {
  /* =====================================================
     REGISTER USER
     POST /api/auth/register
  ===================================================== */
  register: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      if (!email || !password || !firstName || !lastName) {
        throw new AppError(
          "email, password, firstName and lastName are required",
          400
        );
      }

      const result = await AuthService.register(
        email,
        password,
        firstName,
        lastName
      );

      res.status(201).json({
        success: true,
        message: "OTP sent to email",
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     VERIFY OTP
     POST /api/auth/verify-otp
  ===================================================== */
  /* =====================================================
     RESEND VERIFICATION OTP
     POST /api/auth/resend-otp
  ===================================================== */
  resendOtp: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError("Email is required", 400);
      }

      const result = await AuthService.resendOtp(email);

      res.status(200).json({
        success: true,
        message: result.message,
        data: { email: result.email }
      });
    } catch (err) {
      next(err);
    }
  },

  verifyOtp: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        throw new AppError("Email and OTP are required", 400);
      }

      const result = await AuthService.verifyOtp(
        email,
        String(otp).trim()
      );

      res.status(200).json({
        success: true,
        message: "Account verified successfully",
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     LOGIN
     POST /api/auth/login
  ===================================================== */
  login: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new AppError("Email and password are required", 400);
      }

      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     FORGOT PASSWORD
     POST /api/auth/forgot-password
  ===================================================== */
  forgotPassword: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = req.body;

      if (!email) {
        throw new AppError("Email is required", 400);
      }

      const result = await AuthService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     VERIFY PASSWORD RESET OTP
     POST /api/auth/verify-reset-otp

     Step two of forgot-password → verify → reset. Checks the
     code without consuming it, so the reset call that follows
     can still present the same code.
  ===================================================== */
  verifyResetOtp: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email } = req.body;
      // Accept `otp` or `code` — clients disagreed on the name
      const otp = req.body.otp ?? req.body.code;

      if (!email || !otp) {
        throw new AppError("email and otp are required", 400);
      }

      const result = await AuthService.verifyResetOtp(
        email,
        String(otp).trim()
      );

      res.status(200).json({
        success: true,
        message: result.message,
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     RESET PASSWORD
     POST /api/auth/reset-password
  ===================================================== */
  resetPassword: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const { email, newPassword } = req.body;
      const otp = req.body.otp ?? req.body.code;

      if (!email || !otp || !newPassword) {
        throw new AppError(
          "email, otp and newPassword are required",
          400
        );
      }

      const result = await AuthService.resetPassword(
        email,
        String(otp).trim(),
        newPassword
      );

      res.status(200).json({
        success: true,
        message: "Password reset successful",
        data: result
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     GET USER PROFILE
     GET /api/auth/profile
  ===================================================== */
  profile: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).userId as string;

      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const user = await AuthService.profile(userId);

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     UPDATE PROFILE
     PUT /api/auth/profile
  ===================================================== */
  updateProfile: async (
    req: Request,
    res: Response,
    next: NextFunction
  ) => {
    try {
      const userId = (req as any).userId as string;

      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const updated = await AuthService.updateProfile(
        userId,
        req.body
      );

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updated
      });
    } catch (err) {
      next(err);
    }
  }
};