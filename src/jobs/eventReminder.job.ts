import cron from "node-cron";
import { EventReminder } from "../modules/events/eventReminder.model";
import { Event } from "../modules/events/event.model";
import { NotificationService } from "../modules/notifications/notification.service";

export const startEventReminderCron = () => {

  cron.schedule("0 * * * *", async () => {
    console.log("Running Event Reminder Cron...");

    const now = new Date();

    const reminders = await EventReminder.find()
      .populate("event")
      .populate("user");

    for (const reminder of reminders) {

      const eventDate = new Date(reminder.event.date);

      const oneDayBefore = new Date(eventDate);
      oneDayBefore.setDate(eventDate.getDate() - 1);

      // 🔔 DAY BEFORE REMINDER
      if (
        now.toDateString() === oneDayBefore.toDateString() &&
        !reminder.remindedDayBefore
      ) {

        await NotificationService.create(
          "USER",
          "Event Tomorrow",
          `${reminder.event.title} is happening tomorrow.`,
          "event",
          { userId: reminder.user._id.toString() }
        );

        reminder.remindedDayBefore = true;
        await reminder.save();
      }

      // 🔔 DAY OF REMINDER
      if (
        now.toDateString() === eventDate.toDateString() &&
        !reminder.remindedDayOf
      ) {

        await NotificationService.create(
          "USER",
          "Event Today",
          `${reminder.event.title} is happening today.`,
          "event",
          { userId: reminder.user._id.toString() }
        );

        reminder.remindedDayOf = true;
        await reminder.save();
      }
    }
  });
};