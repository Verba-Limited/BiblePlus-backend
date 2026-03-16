import mongoose, { Schema, Document } from "mongoose";

export interface IEventReminder extends Document {
  userId: mongoose.Types.ObjectId;
  eventId: mongoose.Types.ObjectId;
  sent24h: boolean;
  sent1h: boolean;
  sentStart: boolean;
}

const eventReminderSchema = new Schema<IEventReminder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    eventId: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true
    },
    sent24h: {
      type: Boolean,
      default: false
    },
    sent1h: {
      type: Boolean,
      default: false
    },
    sentStart: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

eventReminderSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const EventReminder = mongoose.model<IEventReminder>(
  "EventReminder",
  eventReminderSchema
);