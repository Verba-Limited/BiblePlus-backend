import cron from "node-cron";
import { EventReminder } from "./eventReminder.model";
import { IEvent } from "./event.model";

cron.schedule("* * * * *", async () => {
  const now = new Date();

  // ✅ populate the correct field name
  const reminders = await EventReminder.find({}).populate("eventId");

  for (const reminder of reminders) {
    const raw = reminder.eventId;

    if (!raw || typeof raw === "string") continue;

    const event = raw as unknown as IEvent;

    const eventStart = new Date(event.startDate);
    const diffMs = eventStart.getTime() - now.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    // ✅ use the correct field names from your model
    if (diffHours <= 24 && diffHours > 23 && !reminder.sent24h) {
      console.log(`🔔 24h reminder: User ${reminder.userId}, Event "${event.title}"`);
    }

    if (diffHours <= 1 && diffHours > 0 && !reminder.sent1h) {
      console.log(`🔔 1h reminder: User ${reminder.userId}, Event "${event.title}"`);
    }

    if (diffHours <= 0 && diffHours > -1 && !reminder.sentStart) {
      console.log(`🔔 Starting now: User ${reminder.userId}, Event "${event.title}"`);
    }
  }
});