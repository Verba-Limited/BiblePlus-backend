import { EventGallery } from "./eventGallery.model";
import AppError from "../../../core/AppError";
import { Event } from "../event.model";

export const EventGalleryService = {
  uploadImages: async (eventId: string, files: Express.Multer.File[]) => {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError("Event not found", 404);

    const items = files.map(file => ({
      eventId,
      image: file.filename
    }));

    await EventGallery.insertMany(items);

    return items;
  },

  getImages: async (eventId: string) => {
    return await EventGallery.find({ eventId }).sort({ createdAt: -1 });
  },

  deleteImage: async (imageId: string) => {
    const deleted = await EventGallery.findByIdAndDelete(imageId);
    if (!deleted) throw new AppError("Image not found", 404);

    return deleted;
  }
};
