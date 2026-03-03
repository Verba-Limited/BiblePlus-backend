import mongoose, { Schema, Document } from "mongoose";

export interface IEventReminder extends Document {
  user: mongoose.Types.ObjectId;
  event: mongoose.Types.ObjectId;
  remindedDayBefore: boolean;
  remindedDayOf: boolean;
}

const eventReminderSchema = new Schema<IEventReminder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    event: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    remindedDayBefore: {
      type: Boolean,
      default: false
    },
    remindedDayOf: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

eventReminderSchema.index({ user: 1, event: 1 }, { unique: true });

export const EventReminder = mongoose.model<IEventReminder>(
  "EventReminder",
  eventReminderSchema
);