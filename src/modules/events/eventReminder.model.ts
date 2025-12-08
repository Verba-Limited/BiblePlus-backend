import mongoose, { Schema, Document } from "mongoose";

export interface IEventReminder extends Document {
  userId: string;
  eventId: string;
  notifyBefore: number; // minutes before event
}

const eventReminderSchema = new Schema<IEventReminder>(
  {
    userId: { type: String, required: true },
    eventId: { type: String, required: true },
    notifyBefore: { type: Number, default: 30 } // 30 minutes before
  },
  { timestamps: true }
);

export const EventReminder = mongoose.model<IEventReminder>(
  "EventReminder",
  eventReminderSchema
);
