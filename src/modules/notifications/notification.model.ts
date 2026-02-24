import mongoose, { Schema, Document, Types } from "mongoose";

export type NotificationTarget = "USER" | "ALL";

export interface INotification extends Document {
  user?: Types.ObjectId;
  target: NotificationTarget;
  title: string;
  message: string;
  type: string;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    target: {
      type: String,
      enum: ["USER", "ALL"],
      required: true
    },

    title: {
      type: String,
      required: true
    },

    message: {
      type: String,
      required: true
    },

    type: {
      type: String,
      default: "general"
    },

    read: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

// Performance index
notificationSchema.index({ user: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>(
  "Notification",
  notificationSchema
);