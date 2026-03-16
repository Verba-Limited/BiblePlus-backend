import { EventReminder } from "./eventReminder.model";
import { NotificationService } from "../notifications/notification.service";
import { IEvent } from "./event.model";
import mongoose from "mongoose";

export const EventReminderService = {

  /* ================= ADD REMINDER ================= */
  add: async (userId: string, eventId: string) => {
    const exists = await EventReminder.findOne({ userId, eventId });
    if (exists) return exists;

    return await EventReminder.create({ userId, eventId });
  },

  /* ================= REMOVE REMINDER ================= */
  remove: async (userId: string, eventId: string) => {
    return await EventReminder.findOneAndDelete({ userId, eventId });
  },

  /* ================= LIST FOR USER ================= */
  listForUser: async (userId: string) => {
    return await EventReminder.find({ userId }).populate("eventId");
  },

  /* ================= CRON: PROCESS REMINDERS ================= */
  processReminders: async () => {
    const now = new Date();

    const reminders = await EventReminder.find().populate("eventId");

    for (const reminder of reminders) {
      const event = reminder.eventId as unknown as IEvent;
      if (!event || typeof event === "string") continue;

      const eventTime = new Date(event.startDate);
      const diffMs = eventTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      const userId = (reminder.userId as mongoose.Types.ObjectId).toString();

      // ✅ 24-hour reminder
      if (diffHours <= 24 && diffHours > 23 && !reminder.sent24h) {
        await NotificationService.create(
          "USER",
          "Event Reminder",
          `Your event "${event.title}" starts in 24 hours.`,
          "event-reminder",
          { userId }  // ✅ userId in options
        );
        reminder.sent24h = true;
        await reminder.save();
      }

      // ✅ 1-hour reminder
      if (diffHours <= 1 && diffHours > 0 && !reminder.sent1h) {
        await NotificationService.create(
          "USER",
          "Event Coming Soon",
          `"${event.title}" starts in 1 hour.`,
          "event-reminder",
          { userId }  // ✅ userId in options
        );
        reminder.sent1h = true;
        await reminder.save();
      }

      // ✅ Start-time reminder
      if (diffHours <= 0 && diffHours > -1 && !reminder.sentStart) {
        await NotificationService.create(
          "USER",
          "Event Started",
          `"${event.title}" is starting now.`,
          "event-reminder",
          { userId }  // ✅ userId in options
        );
        reminder.sentStart = true;
        await reminder.save();
      }
    }
  }
};