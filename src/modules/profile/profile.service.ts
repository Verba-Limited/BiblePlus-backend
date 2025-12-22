import { User } from "../auth/auth.model";
import AppError from "../../core/AppError";

export const ProfileService = {
  getProfile: async (userId: string) => {
    const user = await User.findById(userId).select("-password");
    if (!user) throw new AppError("User not found", 404);
    return user;
  },

  updateProfile: async (userId: string, data: any) => {
    const allowedFields = ["firstName", "lastName"];
    const updates: any = {};

    allowedFields.forEach((field) => {
      if (data[field] !== undefined) {
        updates[field] = data[field];
      }
    });

    const user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!user) throw new AppError("User not found", 404);
    return user;
  },

  updateAvatar: async (userId: string, avatar: string) => {
    const user = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true }
    ).select("-password");

    if (!user) throw new AppError("User not found", 404);
    return user;
  },
};
