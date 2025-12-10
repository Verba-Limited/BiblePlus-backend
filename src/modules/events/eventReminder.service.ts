import AppError from "../../core/AppError";
import { EventReminder } from "./eventReminder.model";
import { Event } from "./event.model";
import { NotificationService } from "../notifications/notification.service";

export const EventReminderService = {

  add: async (userId: string, eventId: string) => {
    const exists = await EventReminder.findOne({ userId, eventId });
    if (exists) return exists;

    return await EventReminder.create({ userId, eventId });
  },

  remove: async (userId: string, eventId: string) => {
    return await EventReminder.findOneAndDelete({ userId, eventId });
  },

  listForUser: async (userId: string) => {
    return await EventReminder.find({ userId }).populate("eventId");
  },

  /* --------------------------------------------------------
     CRON ENGINE: AUTO-SEND REMINDERS
  -------------------------------------------------------- */
  processReminders: async () => {
    const now = new Date();

    const reminders = await EventReminder.find().populate("eventId");

    for (const reminder of reminders) {
      const event: any = reminder.eventId;
      if (!event) continue;

      const eventTime = new Date(event.startDate);
      const diffMs = eventTime.getTime() - now.getTime();
      const diffHours = diffMs / (1000 * 60 * 60);

      // 24-hour reminder
      if (diffHours <= 24 && diffHours > 23 && !reminder.sent24h) {
        await NotificationService.create(
          reminder.userId.toString(),
          "Event Reminder",
          `Your event "${event.title}" starts in 24 hours.`,
          "event-reminder",
          { eventId: event._id.toString() }
        );

        reminder.sent24h = true;
        await reminder.save();
      }

      // 1-hour reminder
      if (diffHours <= 1 && diffHours > 0 && !reminder.sent1h) {
        await NotificationService.create(
          reminder.userId.toString(),
          "Event Coming Soon",
          `"${event.title}" starts in 1 hour.`,
          "event-reminder",
          { eventId: event._id.toString() }
        );

        reminder.sent1h = true;
        await reminder.save();
      }

      // Start-time reminder
      if (diffHours <= 0 && diffHours > -1 && !reminder.sentStart) {
        await NotificationService.create(
          reminder.userId.toString(),
          "Event Started",
          `"${event.title}" is starting now.`,
          "event-reminder",
          { eventId: event._id.toString() }
        );

        reminder.sentStart = true;
        await reminder.save();
      }
    }
  }
};
