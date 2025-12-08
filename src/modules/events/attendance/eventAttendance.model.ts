import mongoose, { Schema, Document } from "mongoose";

export interface IEventAttendance extends Document {
  userId: string;
  eventId: string;
}

const attendanceSchema = new Schema<IEventAttendance>(
  {
    userId: { type: String, required: true },
    eventId: { type: String, required: true }
  },
  { timestamps: true }
);

// Prevent same user attending same event twice
attendanceSchema.index({ userId: 1, eventId: 1 }, { unique: true });

export const EventAttendance = mongoose.model<IEventAttendance>(
  "EventAttendance",
  attendanceSchema
);
