import { Event } from "./event.model";
import AppError from "../../core/AppError";
import { NotificationService } from "../notifications/notification.service";
import { escapeRegex, sanitizeUpdate } from "../../utils/sanitize";

/* =========================================================
   TIME WINDOWS

   Older events were saved without an endDate, so filtering
   on endDate alone made them vanish from both the upcoming
   and the past list. Fall back to startDate whenever endDate
   is missing so every event lands in exactly one bucket.
========================================================= */
const pastFilter = (now: Date) => ({
  $or: [
    { endDate: { $lt: now } },
    { endDate: null, startDate: { $lt: now } },
    { endDate: { $exists: false }, startDate: { $lt: now } }
  ]
});

const upcomingFilter = (now: Date) => ({
  $or: [
    { endDate: { $gte: now } },
    { endDate: null, startDate: { $gte: now } },
    { endDate: { $exists: false }, startDate: { $gte: now } }
  ]
});

/** Fields the client must never rewrite on an update. */
const EVENT_PROTECTED_FIELDS = ["slug"];

/** Label each event so the portal can group them without re-deriving dates. */
const withStatus = (event: any) => {
  if (!event) return event;

  const plain = typeof event.toObject === "function" ? event.toObject() : event;
  const now = Date.now();
  const start = plain.startDate ? new Date(plain.startDate).getTime() : null;
  const end = plain.endDate ? new Date(plain.endDate).getTime() : start;

  let status: "upcoming" | "ongoing" | "past" = "upcoming";
  if (end !== null && end < now) status = "past";
  else if (start !== null && start <= now) status = "ongoing";

  return { ...plain, status, isPast: status === "past" };
};

export const EventService = {
  withStatus,

  /* ========================================================
     GET EVENTS WITH OPTIONAL FILTERS
  ======================================================== */
  getEvents: async (filters: any = {}) => {
    const now = new Date();
    const query: any = {};

    if (filters.category) query.category = filters.category;

    if (filters.status === "past") Object.assign(query, pastFilter(now));
    if (filters.status === "upcoming") Object.assign(query, upcomingFilter(now));

    if (filters.search) {
      const term = escapeRegex(filters.search);
      query.$and = [
        {
          $or: [
            { title: { $regex: term, $options: "i" } },
            { description: { $regex: term, $options: "i" } },
            { location: { $regex: term, $options: "i" } },
            { category: { $regex: term, $options: "i" } }
          ]
        }
      ];
    }

    const page = Math.max(Number(filters.page) || 1, 1);
    const limit = Math.min(Math.max(Number(filters.limit) || 20, 1), 100);

    // Past events read newest-first; everything else reads soonest-first.
    const sort: any =
      filters.status === "past" ? { startDate: -1 } : { startDate: 1 };

    const [events, total] = await Promise.all([
      Event.find(query)
        .populate("speakers")
        .sort(sort)
        .skip((page - 1) * limit)
        .limit(limit),
      Event.countDocuments(query)
    ]);

    const pages = Math.ceil(total / limit) || 1;

    return {
      events: events.map(withStatus),
      pagination: {
        total,
        count: events.length,
        page,
        limit,
        pages,
        hasNextPage: page < pages,
        hasPrevPage: page > 1
      }
    };
  },

  /* ========================================================
     GET SINGLE EVENT
  ======================================================== */
  getEvent: async (id: string) => {
    const event = await Event.findById(id).populate("speakers");
    if (!event) throw new AppError("Event not found", 404);
    return withStatus(event);
  },

  /* ========================================================
     UPCOMING EVENTS
  ======================================================== */
  getUpcoming: async (filters: any = {}) => {
    return await EventService.getEvents({ ...filters, status: "upcoming" });
  },

  /* ========================================================
     PAST EVENTS
  ======================================================== */
  getPast: async (filters: any = {}) => {
    return await EventService.getEvents({ ...filters, status: "past" });
  },

  /* ========================================================
     SEARCH
  ======================================================== */
  searchEvents: async (query: string, filters: any = {}) => {
    // A blank term used to reach Mongo as `$regex: undefined` and throw.
    // Treat it as "no filter" and return the normal list instead.
    const term = (query || "").trim();

    return await EventService.getEvents({
      ...filters,
      ...(term ? { search: term } : {})
    });
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

    return withStatus(populated);
  },

  /* ========================================================
     ADMIN: UPDATE EVENT
  ======================================================== */
  updateEvent: async (id: string, data: any) => {
    // The admin editor PUTs the whole record back, `_id` included.
    // Mongo rejects updates that touch immutable paths, so strip them
    // before the correction reaches the database.
    const payload = sanitizeUpdate(data, EVENT_PROTECTED_FIELDS);

    const updated = await Event.findByIdAndUpdate(id, payload, {
      returnDocument: "after",
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

    return withStatus(updated);
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
