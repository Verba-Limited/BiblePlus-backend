import mongoose, { Schema, Document } from "mongoose";

export interface IEventComment extends Document {
  userId: string;
  eventId: string;
  text: string;
}

const eventCommentSchema = new Schema<IEventComment>(
  {
    userId: { type: String, required: true },
    eventId: { type: String, required: true },
    text: { type: String, required: true }
  },
  { timestamps: true }
);

export const EventComment = mongoose.model<IEventComment>(
  "EventComment",
  eventCommentSchema
);
