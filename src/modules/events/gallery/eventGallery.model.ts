import mongoose, { Schema, Document } from "mongoose";

export interface IEventGallery extends Document {
  eventId: string;
  image: string;
  createdAt: Date;
}

const gallerySchema = new Schema<IEventGallery>(
  {
    eventId: { type: String, required: true },
    image: { type: String, required: true } // image filename or URL
  },
  { timestamps: true }
);

export const EventGallery = mongoose.model<IEventGallery>(
  "EventGallery",
  gallerySchema
);
