import { EventReminder } from "./eventReminder.model";
import { Event } from "./event.model";
import AppError from "../../core/AppError";

export const EventReminderService = {
  addReminder: async (userId: string, eventId: string, notifyBefore: number) => {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError("Event not found", 404);

    const existing = await EventReminder.findOne({ userId, eventId });
    if (existing) return existing;

    return await EventReminder.create({ userId, eventId, notifyBefore });
  },

  removeReminder: async (userId: string, eventId: string) => {
    return await EventReminder.deleteOne({ userId, eventId });
  },

  getUserReminders: async (userId: string) => {
    return await EventReminder.find({ userId }).populate("eventId");
  }
};
