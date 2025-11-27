import { Router } from "express";
import { AuthController } from "./auth.controller";
import {
  registerValidator,
  loginValidator,
  resetPasswordValidator,
} from "./auth.validation";
import validate from "../../middleware/validate.middleware";
import authMiddleware from "../../middleware/auth.middleware";

const router = Router();

// AUTH ROUTES

// REGISTER
router.post(
  "/register",
  validate(registerValidator),
  AuthController.register
);

// VERIFY OTP
router.post("/verify-otp", AuthController.verifyOtp);

// LOGIN
router.post("/login", validate(loginValidator), AuthController.login);

// FORGOT PASSWORD
router.post("/forgot-password", AuthController.forgotPassword);

// RESET PASSWORD
router.post(
  "/reset-password",
  validate(resetPasswordValidator),
  AuthController.resetPassword
);

// GET LOGGED-IN USER PROFILE
router.get("/profile", authMiddleware, AuthController.profile);

// UPDATE PROFILE
router.put("/profile", authMiddleware, AuthController.updateProfile);

export default router;
