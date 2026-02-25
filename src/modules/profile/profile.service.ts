import { User } from "../auth/auth.model";
import AppError from "../../core/AppError";
import bcrypt from "bcryptjs";

export const ProfileService = {

  /* =========================
     GET PROFILE
  ========================= */
  async getProfile(userId: string) {

    const user = await User.findById(userId)
      .select("-password")
      .lean();

    if (!user) {
      throw new AppError("User not found", 404);
    }

    return user;
  },

  /* =========================
     UPDATE PROFILE
  ========================= */
  async updateProfile(
    userId: string,
    data: {
      firstName?: string;
      lastName?: string;
      location?: string;
      bio?: string;
    }
  ) {

    if (data.bio && data.bio.length > 160) {
      throw new AppError("Bio cannot exceed 160 characters", 400);
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      data,
      { new: true }
    ).select("-password");

    return updated;
  },

  /* =========================
     CHANGE PASSWORD
  ========================= */
  async changePassword(
    userId: string,
    currentPassword: string,
    newPassword: string
  ) {

    const user = await User.findById(userId);

    if (!user) {
      throw new AppError("User not found", 404);
    }

    const isMatch = await bcrypt.compare(
      currentPassword,
      user.password
    );

    if (!isMatch) {
      throw new AppError("Current password incorrect", 400);
    }

    const hashed = await bcrypt.hash(newPassword, 10);

    user.password = hashed;
    await user.save();

    return { message: "Password changed successfully" };
  },

  /* =========================
     UPDATE NOTIFICATION SETTINGS
  ========================= */
  async updateNotificationSettings(
    userId: string,
    settings: {
      push?: boolean;
      email?: boolean;
    }
  ) {

    const user = await User.findByIdAndUpdate(
      userId,
      { notificationSettings: settings },
      { new: true }
    );

    return user?.notificationSettings;
  },

  /* =========================
     DELETE ACCOUNT
  ========================= */
  async deleteAccount(userId: string) {

    await User.findByIdAndDelete(userId);

    return { message: "Account deleted successfully" };
  },

async updateAvatar(userId: string, avatarPath: string) {

  const user = await User.findByIdAndUpdate(
    userId,
    { avatar: avatarPath },
    { new: true }
  ).select("-password");

  return user;
}

};