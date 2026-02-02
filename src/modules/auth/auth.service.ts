import { User } from "./auth.model";
import { Otp } from "./otp.auth";
import { hashPassword, comparePassword } from "../../utils/bycrypt";
import { generateOtp } from "../../utils/otp";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt";
import AppError from "../../core/AppError";
import { database } from "firebase-admin";

export const AuthService = {
  // -----------------------------------------------------
  // REGISTER USER
  // -----------------------------------------------------
  register: async (email: string, password: string, firstName: string, lastName: string) => {
    const existingUser = await User.findOne({ email });
    if (existingUser) throw new AppError("Email already exists", 400);

    const hashed = await hashPassword(password);

    await User.create({
      email,
      password: hashed,
      firstName,
      lastName,
      verified: false,
    });

    const otpCode = generateOtp();

    await Otp.create({
      email,
      code: otpCode.toString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    console.log("OTP:", otpCode);

    return { message: "OTP sent to email", email };
  },

  // -----------------------------------------------------
  // VERIFY OTP
  // -----------------------------------------------------
  verifyOtp: async (email: string, code: string) => {
    const cleanCode = String(code).trim(); // FIX ➜ normalize OTP

    console.log("Verifying OTP:", cleanCode);

    const otp = await Otp.findOne({ email, code: cleanCode });

    if (!otp) throw new AppError("Invalid OTP", 400);

    if (otp.expiresAt < new Date()) throw new AppError("OTP expired", 400);

    await User.findOneAndUpdate({ email }, { verified: true });
    await Otp.deleteMany({ email });

    const user = await User.findOne({ email });
    if (!user) throw new AppError("User not found", 404);

    return {
      token: generateAccessToken(user._id.toString()),
      refreshToken: generateRefreshToken(user._id.toString()),
      user,
    };
  },

  // -----------------------------------------------------
  // LOGIN USER
  // -----------------------------------------------------
  login: async (email: string, password: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new AppError("Invalid email or password", 400);

    const valid = await comparePassword(password, user.password);
    if (!valid) throw new AppError("Invalid email or password", 400);

    if (!user.verified) throw new AppError("Account not verified", 400);

    return {
      token: generateAccessToken(user._id.toString()),
      refreshToken: generateRefreshToken(user._id.toString()),
      status: "success",
      user,
    };
  },

  // -----------------------------------------------------
  // FORGOT PASSWORD → SEND OTP
  // -----------------------------------------------------
  forgotPassword: async (email: string) => {
    const user = await User.findOne({ email });
    if (!user) throw new AppError("Email not found", 404);

    const otpCode = generateOtp();

    await Otp.create({
      email,
      code: otpCode.toString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    console.log("Reset OTP:", otpCode);

    return { message: "Reset OTP sent" };
  },

  // -----------------------------------------------------
  // RESET PASSWORD
  // -----------------------------------------------------
  resetPassword: async (email: string, otp: string, newPassword: string) => {
    const cleanCode = String(otp).trim(); 

    const verifiedOtp = await Otp.findOne({
      email,
      code: cleanCode,
    });

    if (!verifiedOtp) throw new AppError("Invalid OTP", 400);

    const hashed = await hashPassword(newPassword);

    await User.findOneAndUpdate({ email }, { password: hashed });
    await Otp.deleteMany({ email });

    return { message: "Password reset successful" };
  },

  // -----------------------------------------------------
  // GET USER PROFILE
  // -----------------------------------------------------
  profile: async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new AppError("User not found", 404);
    return user;
  },

  // -----------------------------------------------------
  // UPDATE PROFILE
  // -----------------------------------------------------
  updateProfile: async (userId: string, data: any) => {
    const user = await User.findByIdAndUpdate(userId, data, {
      new: true,
    }).select("-password");

    if (!user) throw new AppError("User not found", 404);

    return user;
  },
};
