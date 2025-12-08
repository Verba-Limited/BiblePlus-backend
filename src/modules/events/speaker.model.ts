import mongoose, { Schema, Document } from "mongoose";

export interface ISpeaker extends Document {
  name: string;
  bio: string;
  image: string;
}

const speakerSchema = new Schema<ISpeaker>(
  {
    name: { type: String, required: true },
    bio: { type: String, default: "" },
    image: { type: String, default: "" }
  },
  { timestamps: true }
);

export const Speaker = mongoose.model<ISpeaker>("Speaker", speakerSchema);
