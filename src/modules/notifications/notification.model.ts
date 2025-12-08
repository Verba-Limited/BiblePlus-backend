import mongoose, { Schema, Document } from "mongoose";

export interface INotification extends Document {
  userId: string | "ALL"; // "ALL" means broadcast to all users
  title: string;
  message: string;
  type: string; // "general", "event", "blog", "prayer", "system"
  data?: any;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: String, required: true }, 
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, default: "general" },
    data: { type: Object, default: {} },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Notification = mongoose.model<INotification>(
  "Notification",
  NotificationSchema
);
