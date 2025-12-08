import { Event } from "./event.model";
import AppError from "../../core/AppError";
import { NotificationService } from "../notifications/notification.service";

export const EventService = {
  // -----------------------------------------------------
  // GET EVENTS WITH OPTIONAL FILTERS
  // -----------------------------------------------------
  getEvents: async (filters: any) => {
    const query: any = {};
    if (filters.category) query.category = filters.category;

    return await Event.find(query)
      .populate("speakers")
      .sort({ startDate: 1 });
  },

  // -----------------------------------------------------
  // GET SINGLE EVENT
  // -----------------------------------------------------
  getEvent: async (id: string) => {
    const event = await Event.findById(id).populate("speakers");
    if (!event) throw new AppError("Event not found", 404);

    return event;
  },

  // -----------------------------------------------------
  // UPCOMING EVENTS
  // -----------------------------------------------------
  getUpcoming: async () => {
    return await Event.find({ startDate: { $gte: new Date() } })
      .populate("speakers")
      .sort({ startDate: 1 });
  },

  // -----------------------------------------------------
  // PAST EVENTS
  // -----------------------------------------------------
  getPast: async () => {
    return await Event.find({ endDate: { $lt: new Date() } })
      .populate("speakers")
      .sort({ startDate: -1 });
  },

  // -----------------------------------------------------
  // SEARCH EVENTS
  // -----------------------------------------------------
  searchEvents: async (query: string) => {
    return await Event.find({
      title: { $regex: query, $options: "i" }
    }).populate("speakers");
  },

  // -----------------------------------------------------
  // ADMIN: CREATE EVENT
  // -----------------------------------------------------
  createEvent: async (data: any) => {
    if (data.liveStream?.url) {
      data.isOnline = true;
    }

    const created = await Event.create(data);

    // created can be an array when multiple docs are passed; normalize to single document
    const createdDoc = Array.isArray(created) ? created[0] : created;

    // Correct populate usage
    const populated = await Event.findById(createdDoc._id).populate("speakers");

    // Best-effort notification
    NotificationService.create(
      "ALL",
      "New Event Posted",
      `A new event "${populated?.title}" has been posted.`,
      "event",
      { eventId: populated?._id }
    ).catch(() => {});

    return populated;
  },

  // -----------------------------------------------------
  // ADMIN: UPDATE EVENT
  // -----------------------------------------------------
  updateEvent: async (id: string, data: any) => {
    const event = await Event.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    }).populate("speakers");

    if (!event) throw new AppError("Event not found", 404);

    NotificationService.create(
      "ALL",
      "Event Updated",
      `Event "${event.title}" was updated.`,
      "event-update",
      { eventId: event._id }
    ).catch(() => {});

    return event;
  },

  // -----------------------------------------------------
  // ADMIN: UPDATE LIVESTREAM ONLY
  // -----------------------------------------------------
  updateLiveStream: async (id: string, stream: any) => {
    const event = await Event.findById(id);
    if (!event) throw new AppError("Event not found", 404);

    event.liveStream = { ...(event.liveStream || {}), ...stream };
    event.isOnline = true;

    await event.save();

    const populated = await Event.findById(event._id).populate("speakers");

    NotificationService.create(
      "ALL",
      "Livestream Updated",
      `Livestream for "${populated?.title}" is available.`,
      "livestream",
      { eventId: populated?._id }
    ).catch(() => {});

    return populated;
  },

  // -----------------------------------------------------
  // ADMIN: DELETE EVENT
  // -----------------------------------------------------
  deleteEvent: async (id: string) => {
    const removed = await Event.findByIdAndDelete(id);
    if (!removed) throw new AppError("Event not found", 404);

    NotificationService.create(
      "ALL",
      "Event Cancelled",
      `The event "${removed.title}" has been cancelled.`,
      "event-delete",
      { eventId: removed._id }
    ).catch(() => {});

    return removed;
  }
};
