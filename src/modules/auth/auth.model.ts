import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcryptjs";
import { HydratedDocument } from "mongoose";

/* =====================================================
   INTERFACE
===================================================== */

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
  fcmToken?: string;

  comparePassword(candidate: string): Promise<boolean>;
}

/* =====================================================
   SCHEMA
===================================================== */

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
    },

    fcmToken: { type: String, default: "" }
  },
  {
    timestamps: true,
    toJSON: {
      transform: (_doc, ret) => {
        const { password, __v, ...rest } = ret;
        return rest;
      }
    }
  }
);

/* =====================================================
   METHODS
===================================================== */

userSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

/* =====================================================
   INDEXES
===================================================== */

// Compound index — speeds up login query { email, isDeleted: false }
userSchema.index({ email: 1, isDeleted: 1 });

/* =====================================================
   GLOBAL QUERY FILTER (Soft Delete Protection)
===================================================== */

// Automatically exclude deleted users
function excludeDeleted(this: any) {
  this.where({ isDeleted: false });
}

userSchema.pre("find", excludeDeleted);
userSchema.pre("findOne", excludeDeleted);
userSchema.pre("findOneAndUpdate", excludeDeleted);

/* =====================================================
   MODEL EXPORT
===================================================== */

export const User: Model<IUser> =
  mongoose.model<IUser>("User", userSchema);