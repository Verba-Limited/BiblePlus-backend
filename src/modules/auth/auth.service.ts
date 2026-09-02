import { User } from "./auth.model";
import { Otp } from "./otp.auth";
import { hashPassword, comparePassword } from "../../utils/bycrypt";
import { generateOtp } from "../../utils/otp";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../utils/jwt";
import AppError from "../../core/AppError";
import { EmailService } from "../../services/email.service";

/* =====================================================
   HELPERS
===================================================== */
const generateUsername = async (
  email: string,
  firstName?: string
): Promise<string> => {
  const base = (
    firstName || email.split("@")[0]
  )
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");

  let username = base;
  let counter = 0;

  while (await User.exists({ username })) {
    counter += 1;
    username = `${base}_${counter}`;
  }

  return username;
};

/* =====================================================
   AUTH SERVICE
===================================================== */
export const AuthService = {
  /* =====================================================
     REGISTER USER
  ===================================================== */
  async register(
    email: string,
    password: string,
    firstName: string,
    lastName: string
  ) {
    const existing = await User.findOne({ email });
    if (existing) {
      throw new AppError("Email already exists", 400);
    }

    const hashedPassword = await hashPassword(password);
    const username = await generateUsername(email, firstName);

    await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      username,
      role: "user",
      verified: false,
    });

    const otpCode = generateOtp();

    await Otp.create({
      email,
      code: otpCode.toString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Send OTP via email
    EmailService.sendOtp(email, firstName, otpCode.toString()).catch(console.error);

    return {
      message: "OTP sent to email",
      email,
    };
  },

  /* =====================================================
     RESEND VERIFICATION OTP

     With no bypass code, the emailed OTP is the only way in —
     so a user whose first email never arrived needs a way to
     ask for another one rather than being stranded on an
     unverified account they cannot re-register.
  ===================================================== */
  async resendOtp(email: string) {
    const user = await User.findOne({ email });
    if (!user) throw new AppError("Email not found", 404);

    if (user.verified) {
      throw new AppError("Account is already verified", 400);
    }

    // Invalidate any outstanding codes so only the newest works
    await Otp.deleteMany({ email });

    const otpCode = generateOtp();

    await Otp.create({
      email,
      code: otpCode.toString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    // Awaited: if the mail cannot be sent, say so rather than
    // reporting success for a code that will never arrive.
    const sent = await EmailService.sendOtp(
      email,
      user.firstName ?? "Friend",
      otpCode.toString()
    );

    if (sent === false) {
      throw new AppError(
        "Could not send the verification email. Please try again shortly.",
        502
      );
    }

    return { message: "A new OTP has been sent to your email", email };
  },

  /* =====================================================
     VERIFY OTP
  ===================================================== */
 async verifyOtp(email: string, code: string) {
  const cleanCode = String(code).trim();

  if (!cleanCode) {
    throw new AppError("OTP is required", 400);
  }

  // The emailed code is the only accepted credential, in every
  // environment. There is no master or bypass code.
  const otp = await Otp.findOne({ email, code: cleanCode });

  if (!otp) {
    throw new AppError("Invalid OTP", 400);
  }

  if (otp.expiresAt < new Date()) {
    throw new AppError("OTP expired. Request a new one.", 400);
  }

  const user = await User.findOneAndUpdate(
    { email },
    { verified: true },
    { returnDocument: "after" }
  );

  if (!user) throw new AppError("User not found", 404);

  await Otp.deleteMany({ email });

  EmailService.sendWelcome(user.email, user.firstName ?? "Friend").catch(console.error);

  return {
    token: generateAccessToken({
      userId: user._id.toString(),
      role: user.role,
    }),
    refreshToken: generateRefreshToken(user._id.toString()),
    user,
  };
},

  /* =====================================================
     LOGIN USER
  ===================================================== */
  async login(email: string, password: string) {
    const user = await User.findOne({ email }).select("+password");
    if (!user) throw new AppError("Invalid credentials", 400);

    // ✅ Reject unverified users before running expensive bcrypt
    if (!user.verified) throw new AppError("Account not verified", 400);

    // ✅ Deactivated accounts keep their data but cannot sign in
    if (user.isActive === false) {
      throw new AppError(
        "Your account has been deactivated. Please contact support.",
        403
      );
    }

    const valid = await comparePassword(password, user.password);
    if (!valid) throw new AppError("Invalid credentials", 400);

    return {
      token: generateAccessToken({
        userId: user._id.toString(),
        role: user.role,
      }),
      refreshToken: generateRefreshToken(user._id.toString()),
      user,
    };
  },

  /* =====================================================
     FORGOT PASSWORD
  ===================================================== */
  async forgotPassword(email: string) {
    const user = await User.findOne({ email });
    if (!user) throw new AppError("Email not found", 404);

    const otpCode = generateOtp();

    await Otp.create({
      email,
      code: otpCode.toString(),
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    EmailService.sendPasswordReset(
      email,
      user.firstName ?? "Friend",
      otpCode.toString()
    ).catch(console.error);

    return { message: "Reset OTP sent" };
  },

  /* =====================================================
     RESET PASSWORD
  ===================================================== */
  async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ) {
    const cleanCode = String(otp).trim();

    if (!cleanCode) {
      throw new AppError("OTP is required", 400);
    }

    // Emailed code only — no master or bypass code, in any environment.
    const record = await Otp.findOne({ email, code: cleanCode });

    if (!record) {
      throw new AppError("Invalid OTP", 400);
    }

    if (record.expiresAt < new Date()) {
      throw new AppError("OTP expired. Request a new one.", 400);
    }

    const hashed = await hashPassword(newPassword);

    await User.findOneAndUpdate(
      { email },
      { password: hashed }
    );

    await Otp.deleteMany({ email });

    return { message: "Password reset successful" };
  },

  /* =====================================================
     PROFILE
  ===================================================== */
  async profile(userId: string) {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new AppError("User not found", 404);
    return user;
  },

  async updateProfile(userId: string, data: any) {
    delete data.username;
    delete data.role;
    delete data.verified;

    const user = await User.findByIdAndUpdate(
      userId,
      data,
      { returnDocument: "after" }
    ).select("-password");

    if (!user) throw new AppError("User not found", 404);
    return user;
  },
};