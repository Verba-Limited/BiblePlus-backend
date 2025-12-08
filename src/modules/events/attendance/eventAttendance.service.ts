import { EventAttendance } from "./eventAttendance.model";
import AppError from "../../../core/AppError";
import { Event } from "../event.model";

export const EventAttendanceService = {
  attend: async (userId: string, eventId: string) => {
    const event = await Event.findById(eventId);
    if (!event) throw new AppError("Event not found", 404);

    try {
      const attending = await EventAttendance.create({ userId, eventId });
      return attending;
    } catch (err: any) {
      if (err.code === 11000) {
        // Already attending — do not throw
        return { userId, eventId, alreadyAttending: true };
      }
      throw err;
    }
  },

  unattend: async (userId: string, eventId: string) => {
    await EventAttendance.deleteOne({ userId, eventId });
    return { message: "You are no longer attending" };
  },

  getAttendees: async (eventId: string) => {
    return await EventAttendance.find({ eventId });
  },

  countAttendees: async (eventId: string) => {
    return await EventAttendance.countDocuments({ eventId });
  },

  userIsAttending: async (userId: string, eventId: string) => {
    const record = await EventAttendance.findOne({ userId, eventId });
    return !!record;
  }
};
