import mongoose, { Schema, Document } from "mongoose";

export interface IEventCategory extends Document {
  name: string;
  icon: string;
}

const categorySchema = new Schema<IEventCategory>(
  {
    name: { type: String, required: true, unique: true },
    icon: { type: String, default: "" } // optional icon URL
  },
  { timestamps: true }
);

export const EventCategory = mongoose.model<IEventCategory>("EventCategory", categorySchema);
