import { Event } from "./event.model";
import AppError from "../../core/AppError";
import { NotificationService } from "../notifications/notification.service";

export const EventService = {
  /* ========================================================
     GET EVENTS WITH OPTIONAL FILTERS
  ======================================================== */
  getEvents: async (filters: any) => {
    const query: any = {};
    if (filters.category) query.category = filters.category;

    return await Event.find(query)
      .populate("speakers")
      .sort({ startDate: 1 });
  },

  /* ========================================================
     GET SINGLE EVENT
  ======================================================== */
  getEvent: async (id: string) => {
    const event = await Event.findById(id).populate("speakers");
    if (!event) throw new AppError("Event not found", 404);
    return event;
  },

  /* ========================================================
     UPCOMING EVENTS
  ======================================================== */
  getUpcoming: async () => {
    return await Event.find({ startDate: { $gte: new Date() } })
      .populate("speakers")
      .sort({ startDate: 1 });
  },

  /* ========================================================
     PAST EVENTS
  ======================================================== */
  getPast: async () => {
    return await Event.find({ endDate: { $lt: new Date() } })
      .populate("speakers")
      .sort({ startDate: -1 });
  },

  /* ========================================================
     SEARCH
  ======================================================== */
  searchEvents: async (query: string) => {
    return await Event.find({
      title: { $regex: query, $options: "i" }
    }).populate("speakers");
  },

  /* ========================================================
     ADMIN: CREATE EVENT
  ======================================================== */
  createEvent: async (data: any) => {
    // Auto-mark online if livestream exists
    if (data.liveStream?.url) data.isOnline = true;

    const eventDoc = await Event.create(data);
    const created = Array.isArray(eventDoc) ? eventDoc[0] : eventDoc;

    const populated = await Event.findById(created._id).populate("speakers");

    // Notify ALL users (best effort)
    NotificationService.create(
      "ALL",
      "New Event Posted",
      `A new event "${populated?.title}" has been created.`,
      "event-create"
    ).catch(() => {});

    return populated;
  },

  /* ========================================================
     ADMIN: UPDATE EVENT
  ======================================================== */
  updateEvent: async (id: string, data: any) => {
    const updated = await Event.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true
    }).populate("speakers");

    if (!updated) throw new AppError("Event not found", 404);

    // Notify ALL users
    NotificationService.create(
      "ALL",
      "Event Updated",
      `The event "${updated.title}" has been updated.`,
      "event-update"
    ).catch(() => {});

    return updated;
  },

  /* ========================================================
     ADMIN: UPDATE LIVESTREAM
  ======================================================== */
  updateLiveStream: async (id: string, stream: any) => {
    const event = await Event.findById(id);
    if (!event) throw new AppError("Event not found", 404);

    event.liveStream = { ...(event.liveStream || {}), ...stream };
    event.isOnline = true;

    await event.save();

    const populated = await Event.findById(id).populate("speakers");

    NotificationService.create(
      "ALL",
      "Livestream Available",
      `Livestream updated for "${populated?.title}".`,
      "event-livestream"
    ).catch(() => {});

    return populated;
  },

  /* ========================================================
     ADMIN: DELETE EVENT
  ======================================================== */
  deleteEvent: async (id: string) => {
    const removed = await Event.findByIdAndDelete(id);
    if (!removed) throw new AppError("Event not found", 404);

    NotificationService.create(
      "ALL",
      "Event Cancelled",
      `The event "${removed.title}" has been cancelled.`,
      "event-delete"
    ).catch(() => {});

    return removed;
  }
};
