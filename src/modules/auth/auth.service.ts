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
   CONSTANTS
===================================================== */
/** How long a one-time passcode stays valid. */
const OTP_TTL_MS = 5 * 60 * 1000;

/**
 * Look up a live OTP for one specific flow.
 *
 * Verification also accepts rows written before `purpose`
 * existed, so codes already in flight during a deploy keep
 * working. Password reset never does — a legacy row of
 * unknown origin must not be usable to change a password.
 */
const findLiveOtp = async (
  email: string,
  code: string,
  purpose: "verification" | "password-reset"
) => {
  const scope =
    purpose === "verification"
      ? { $or: [{ purpose }, { purpose: { $exists: false } }] }
      : { purpose };

  const record = await Otp.findOne({ email, code, ...scope });

  if (!record) throw new AppError("Invalid OTP", 400);

  if (record.expiresAt < new Date()) {
    throw new AppError("OTP expired. Request a new one.", 400);
  }

  return record;
};

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

  // `includeDeleted` matters here: the unique index on username spans
  // soft-deleted rows, so a username that only a deleted user holds
  // would still be rejected on insert.
  while (
    await User.findOne({ username }, null, { includeDeleted: true }).select("_id").lean()
  ) {
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
    // `includeDeleted` is essential. The unique index on email covers
    // soft-deleted rows, but the default query filter hides them — so
    // without this the check passes and the insert then fails with a
    // raw duplicate-key error the user cannot act on.
    const existing = await User.findOne({ email }, null, {
      includeDeleted: true,
    });

    if (existing?.isDeleted) {
      throw new AppError(
        "This email belonged to an account that was removed. Please contact support to restore it or use a different email.",
        409
      );
    }

    const hashedPassword = await hashPassword(password);

    if (existing) {
      if (existing.verified) {
        throw new AppError(
          "This email is already registered. Please log in instead.",
          409
        );
      }

      // Signup was started but never verified, so nobody has proven
      // ownership yet. Let them pick up where they left off with the
      // details they just submitted, rather than dead-ending them on
      // "email already exists" with no way forward.
      existing.password = hashedPassword;
      if (firstName) existing.firstName = firstName;
      if (lastName) existing.lastName = lastName;
      await existing.save();

      await Otp.deleteMany({ email, purpose: "verification" });

      const resendCode = generateOtp();
      await Otp.create({
        email,
        code: resendCode.toString(),
        purpose: "verification",
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      });

      EmailService.sendOtp(
        email,
        existing.firstName ?? firstName,
        resendCode.toString()
      ).catch(console.error);

      return {
        message:
          "This signup was never completed. We've sent a new verification code to your email.",
        email,
      };
    }

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
      purpose: "verification",
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
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

    // Invalidate any outstanding verification codes so only the newest
    // works. Scoped, so a live password-reset code is left alone.
    await Otp.deleteMany({ email, purpose: "verification" });

    const otpCode = generateOtp();

    await Otp.create({
      email,
      code: otpCode.toString(),
      purpose: "verification",
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
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
  await findLiveOtp(email, cleanCode, "verification");

  const user = await User.findOneAndUpdate(
    { email },
    { verified: true },
    { returnDocument: "after" }
  );

  if (!user) throw new AppError("User not found", 404);

  await Otp.deleteMany({ email, purpose: "verification" });

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

    // Only the newest reset code should work
    await Otp.deleteMany({ email, purpose: "password-reset" });

    const otpCode = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    await Otp.create({
      email,
      code: otpCode.toString(),
      purpose: "password-reset",
      expiresAt,
    });

    // Awaited: if the mail cannot be sent, say so rather than
    // reporting success for a code that will never arrive.
    const sent = await EmailService.sendPasswordReset(
      email,
      user.firstName ?? "Friend",
      otpCode.toString()
    );

    if (sent === false) {
      throw new AppError(
        "Could not send the reset email. Please try again shortly.",
        502
      );
    }

    return {
      message: "A password reset code has been sent to your email",
      email,
      expiresAt,
      expiresInSeconds: Math.round(OTP_TTL_MS / 1000),
    };
  },

  /* =====================================================
     VERIFY PASSWORD RESET OTP

     Step two of the three-step flow: forgot-password →
     verify-reset-otp → reset-password.

     Deliberately does NOT consume the code, so the reset
     call that follows can still present it. That also keeps
     reset-password working unchanged for existing clients
     that skip this step.
  ===================================================== */
  async verifyResetOtp(email: string, otp: string) {
    const cleanCode = String(otp).trim();

    if (!cleanCode) {
      throw new AppError("OTP is required", 400);
    }

    const record = await findLiveOtp(email, cleanCode, "password-reset");

    return {
      message: "OTP verified. You can now set a new password.",
      email,
      expiresAt: record.expiresAt,
      expiresInSeconds: Math.max(
        0,
        Math.round((record.expiresAt.getTime() - Date.now()) / 1000)
      ),
    };
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

    if (!newPassword || String(newPassword).length < 6) {
      throw new AppError("Password must be at least 6 characters", 400);
    }

    // Emailed code only — no master or bypass code, in any environment.
    // Scoped to password-reset so a signup verification code cannot be
    // used to take over an account.
    await findLiveOtp(email, cleanCode, "password-reset");

    const hashed = await hashPassword(newPassword);

    const updated = await User.findOneAndUpdate(
      { email },
      { password: hashed }
    );

    if (!updated) throw new AppError("User not found", 404);

    // Burn the code — reset OTPs are single use
    await Otp.deleteMany({ email, purpose: "password-reset" });

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