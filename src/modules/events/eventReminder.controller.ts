import { Request, Response, NextFunction } from "express";
import { EventReminderService } from "./eventReminder.service";
import { NotificationService } from "../notifications/notification.service";
import { SocketNotify } from "../notifications/socketNotify";
import { Event } from "../events/event.model";

export const EventReminderController = {
  /* ================================================
     ADD REMINDER
  ================================================= */
  add: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { eventId, notifyBefore } = req.body;

      if (!eventId) {
        return res.status(400).json({
          success: false,
          message: "eventId is required"
        });
      }

      const reminder = await EventReminderService.addReminder(
        userId,
        eventId,
        notifyBefore || 30 // default: 30 minutes before event
      );

      // Fetch event for notification
      const event = await Event.findById(eventId);

      if (event) {
        // In-app notification
        await NotificationService.create(
          userId,
          "Event Reminder Added ⏰",
          `You will be reminded ${notifyBefore || 30} minutes before "${event.title}".`,
          "event",
          { eventId }
        );

        // Real-time push
        SocketNotify.sendToUser(userId, {
          type: "eventReminderAdded",
          eventId,
          notifyBefore: notifyBefore || 30,
          message: `Reminder set for event: ${event.title}`
        });
      }

      res.json({ success: true, data: reminder });
    } catch (err) {
      next(err);
    }
  },

  /* ================================================
     REMOVE REMINDER
  ================================================= */
  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { eventId } = req.body;

      if (!eventId) {
        return res.status(400).json({
          success: false,
          message: "eventId is required"
        });
      }

      await EventReminderService.removeReminder(userId, eventId);

      // Notify user
      await NotificationService.create(
        userId,
        "Event Reminder Removed",
        `Reminder for event has been removed.`,
        "event",
        { eventId }
      );

      // Real-time sync
      SocketNotify.sendToUser(userId, {
        type: "eventReminderRemoved",
        eventId
      });

      res.json({ success: true, message: "Reminder removed" });
    } catch (err) {
      next(err);
    }
  },

  /* ================================================
     GET USER REMINDERS
  ================================================= */
  all: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const reminders = await EventReminderService.getUserReminders(userId);

      res.json({ success: true, data: reminders });
    } catch (err) {
      next(err);
    }
  }
};
