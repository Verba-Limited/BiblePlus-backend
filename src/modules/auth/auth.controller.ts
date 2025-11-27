import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

export const AuthController = {
  // REGISTER USER
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const result = await AuthService.register(email, password);

      res.status(200).json({
        success: true,
        message: "OTP sent to email",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // VERIFY OTP
  verifyOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otp } = req.body;

      const result = await AuthService.verifyOtp(email, otp);

      res.status(200).json({
        success: true,
        message: "Account verified",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // LOGIN
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(email, password);

      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // FORGOT PASSWORD - SEND OTP
  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;

      const result = await AuthService.forgotPassword(email);

      res.status(200).json({
        success: true,
        message: "Reset OTP sent",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // RESET PASSWORD
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otp, newPassword } = req.body;

      const result = await AuthService.resetPassword(email, otp, newPassword);

      res.status(200).json({
        success: true,
        message: "Password reset successful",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // GET PROFILE
  profile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const user = await AuthService.profile(userId);

      res.status(200).json({
        success: true,
        data: user,
      });
    } catch (err) {
      next(err);
    }
  },

  // UPDATE PROFILE
  updateProfile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const updated = await AuthService.updateProfile(userId, req.body);

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        data: updated,
      });
    } catch (err) {
      next(err);
    }
  },
};
