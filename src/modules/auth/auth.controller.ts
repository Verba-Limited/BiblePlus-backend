import { Request, Response, NextFunction } from "express";
import { AuthService } from "./auth.service";

export const AuthController = {

  // -----------------------------------------------------
  // REGISTER USER
  // -----------------------------------------------------
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password, firstName, lastName } = req.body;

      const result = await AuthService.register(email, password , firstName, lastName);

      res.status(200).json({
        success: true,
        message: "OTP sent to email",
        data: { firstName, lastName, ...result },
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // VERIFY OTP
  // -----------------------------------------------------
  verifyOtp: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otp } = req.body;

      if (!email || !otp) {
        return res.status(400).json({
          success: false,
          message: "Email and OTP are required",
          
        });
      }

      // Normalize OTP as string
      const code = String(otp).trim();

      const result = await AuthService.verifyOtp(email, code);

      res.status(200).json({
        success: true,
        message: "Account verified successfully",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // LOGIN
  // -----------------------------------------------------
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

  // -----------------------------------------------------
  // FORGOT PASSWORD → SEND OTP
  // -----------------------------------------------------
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

  // -----------------------------------------------------
  // RESET PASSWORD
  // -----------------------------------------------------
  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, otp, newPassword } = req.body;

      if (!email || !otp || !newPassword) {
        return res.status(400).json({
          success: false,
          message: "Email, OTP and newPassword are required",
        });
      }

      const code = String(otp).trim();

      const result = await AuthService.resetPassword(email, code, newPassword);

      res.status(200).json({
        success: true,
        message: "Password reset successful",
        data: result,
      });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // GET USER PROFILE
  // -----------------------------------------------------
  profile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore (set by auth middleware)
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

  // -----------------------------------------------------
  // UPDATE PROFILE
  // -----------------------------------------------------
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
