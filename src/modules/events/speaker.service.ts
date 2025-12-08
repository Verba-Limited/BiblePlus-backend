import { Speaker } from "./speaker.model";
import AppError from "../../core/AppError";

export const SpeakerService = {
  // Create new speaker
  createSpeaker: async (data: any) => {
    return await Speaker.create({
      name: data.name,
      bio: data.bio || "",
      image: data.image || ""
    });
  },

  // Update speaker
  updateSpeaker: async (id: string, data: any) => {
    const speaker = await Speaker.findByIdAndUpdate(id, data, { new: true });
    if (!speaker) throw new AppError("Speaker not found", 404);
    return speaker;
  },

  // Delete speaker
  deleteSpeaker: async (id: string) => {
    const removed = await Speaker.findByIdAndDelete(id);
    if (!removed) throw new AppError("Speaker not found", 404);
    return removed;
  },

  // Get all speakers
  getAllSpeakers: async () => {
    return await Speaker.find({}).sort({ createdAt: -1 });
  },

  // Get single speaker
  getSpeaker: async (id: string) => {
    const speaker = await Speaker.findById(id);
    if (!speaker) throw new AppError("Speaker not found", 404);
    return speaker;
  }
};
