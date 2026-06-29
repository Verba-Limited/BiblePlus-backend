import mongoose, { Schema, Document } from "mongoose";

export interface IEvent extends Document {
  title: string;
  description: string;
  category: string;
  speakers: string[]; // speaker IDs
  coverImage: string;
  location: string;
  isOnline: boolean;

  frequency?: "Once" | "Daily" | "Weekly" | "Monthly" | "Yearly";

  // ⭐ NEW livestream structure
  liveStream?: {
    platform: string;   // youtube, zoom, facebook, custom
    url: string;        // livestream link
    thumbnail: string;  // preview image
  };

  startDate: Date;
  endDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },

    // conference, prayer, youth, worship, etc.
    category: { type: String, default: "general" },

    // ⭐ Multiple speakers attached to one event
    speakers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Speaker",
        default: []
      }
    ],

    coverImage: { type: String, default: "" },

    // If physical, this is venue name; if online, can be empty
    location: { type: String, default: "" },

    // Is this event online or physical?
    isOnline: { type: Boolean, default: false },

    frequency: {
      type: String,
      enum: ["Once", "Daily", "Weekly", "Monthly", "Yearly"],
      default: "Once"
    },

    // ⭐ NEW — livestream object
    liveStream: {
      platform: { type: String, default: "" },   // youtube | zoom | facebook | custom
      url: { type: String, default: "" },
      thumbnail: { type: String, default: "" }
    },

    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true }
  },
  { timestamps: true }
);

export const Event = mongoose.model<IEvent>("Event", eventSchema);
