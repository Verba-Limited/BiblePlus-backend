import cron from "node-cron";
import { EventReminder } from "./eventReminder.model";
import { IEvent } from "./event.model"; // import interface

cron.schedule("* * * * *", async () => {
  const now = new Date();

  const reminders = await EventReminder.find({}).populate("eventId");

  for (const reminder of reminders) {
    const raw = reminder.eventId;

    // ❗ Type narrowing: check if populated (object) or string
    if (!raw || typeof raw === "string") continue;

    // Now raw is the event object → safely cast it
    const event = raw as unknown as IEvent;

    const eventStart = new Date(event.startDate);
    const diffMinutes = Math.round((eventStart.getTime() - now.getTime()) / 60000);

    if (diffMinutes === reminder.notifyBefore) {
      console.log(
        `🔔 Reminder: User ${reminder.userId}, Event "${event.title}" starts in ${reminder.notifyBefore} min`
      );
    }
  }
});
