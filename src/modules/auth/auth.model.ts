import mongoose, { Schema, Document } from "mongoose";
import bcrypt from "bcrypt";

export interface IUser extends Document {
  email: string;
  password: string;

  firstName?: string;
  lastName?: string;
  username: string;
  avatar?: string;

  location?: string;
  bio?: string;

  notificationSettings: {
    push: boolean;
    email: boolean;
  };

  role: "user" | "admin";
  verified: boolean;
  isDeleted: boolean;

  comparePassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    password: {
      type: String,
      required: true,
      minlength: 6
    },

    firstName: {
      type: String,
      trim: true
    },

    lastName: {
      type: String,
      trim: true
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true
    },

    avatar: {
      type: String
    },

    location: {
      type: String,
      trim: true
    },

    bio: {
      type: String,
      maxlength: 160,
      trim: true
    },

    notificationSettings: {
      push: { type: Boolean, default: true },
      email: { type: Boolean, default: true }
    },

    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user"
    },

    verified: {
      type: Boolean,
      default: false
    },

    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);