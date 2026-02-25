import mongoose, { Schema, Document, Model } from "mongoose";
import bcrypt from "bcrypt";
import { CallbackWithoutResultAndOptionalError } from "mongoose";

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
    }
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
   HOOKS
===================================================== */

// Normalize username + email
userSchema.pre("save", function (next) {
  if (this.username) {
    this.username = this.username.toLowerCase();
  }
  if (this.email) {
    this.email = this.email.toLowerCase();
  }
  next();
});

// Hash password before save
userSchema.pre("save", async function (this: IUser) {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

/* =====================================================
   METHODS
===================================================== */

userSchema.methods.comparePassword = async function (
  candidate: string
): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

/* =====================================================
   GLOBAL QUERY FILTER (Soft Delete Protection)
===================================================== */

// Automatically exclude deleted users
function excludeDeleted(this: any, next: any) {
  this.where({ isDeleted: false });
  next();
}

userSchema.pre("find", excludeDeleted);
userSchema.pre("findOne", excludeDeleted);
userSchema.pre("findOneAndUpdate", excludeDeleted);

/* =====================================================
   MODEL EXPORT
===================================================== */

export const User: Model<IUser> =
  mongoose.model<IUser>("User", userSchema);