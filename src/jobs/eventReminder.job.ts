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

  const event = reminder.event as any;
  const user = reminder.user as any;

  const eventDate = new Date(event.date);

  const oneDayBefore = new Date(eventDate);
  oneDayBefore.setDate(eventDate.getDate() - 1);

  if (
    now.toDateString() === oneDayBefore.toDateString() &&
    !reminder.remindedDayBefore
  ) {
    await NotificationService.create(
      "USER",
      "Event Tomorrow",
      `${event.title} is happening tomorrow.`,
      "event",
      { userId: user._id.toString() }
    );

    reminder.remindedDayBefore = true;
    await reminder.save();
  }

  if (
    now.toDateString() === eventDate.toDateString() &&
    !reminder.remindedDayOf
  ) {
    await NotificationService.create(
      "USER",
      "Event Today",
      `${event.title} is happening today.`,
      "event",
      { userId: user._id.toString() }
    );

    reminder.remindedDayOf = true;
    await reminder.save();
  }
}
  });
};