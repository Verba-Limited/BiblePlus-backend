import mongoose from "mongoose";
import { User } from "../auth/auth.model";
import { Blog } from "../blog/blog.model";
import { BlogLike } from "../blog/blogLike.model";
import { BlogBookmark } from "../blog/blogBookmark.model";
import { Event } from "../events/event.model";
import { Prayer } from "../prayer/prayer.model";
import { Notification } from "../notifications/notification.model";
import { BlogTrendingService } from "../blog/blogTrending.service";

export const AdminAnalyticsService = {

  // -----------------------------------------------------
  // OVERVIEW TOTALS
  // -----------------------------------------------------
  getOverview: async () => {
    const now = new Date();

    const [
      totalUsers,
      verifiedUsers,
      inactiveUsers,
      deletedUsers,
      totalBlogs,
      draftBlogs,
      totalEvents,
      upcomingEvents,
      pastEvents,
      totalPrayers,
      totalLikes,
      totalBookmarks,
      totalNotifications
    ] = await Promise.all([
      // Soft-deleted accounts are excluded here exactly as they are
      // in the Users list, so the two screens agree on the total.
      User.countDocuments({}),
      User.countDocuments({ verified: true }),
      User.countDocuments({ isActive: false }),
      User.countDocuments({ isDeleted: true }).setOptions({ includeDeleted: true }),
      Blog.countDocuments({ status: "published" }),
      Blog.countDocuments({ status: "draft" }),
      Event.countDocuments(),
      Event.countDocuments({ startDate: { $gte: now } }),
      Event.countDocuments({
        $or: [
          { endDate: { $lt: now } },
          { endDate: { $in: [null, undefined] }, startDate: { $lt: now } }
        ]
      }),
      Prayer.countDocuments(),
      BlogLike.countDocuments(),
      BlogBookmark.countDocuments(),
      Notification.countDocuments()
    ]);

    return {
      totalUsers,
      verifiedUsers,
      unverifiedUsers: totalUsers - verifiedUsers,
      activeUsers: totalUsers - inactiveUsers,
      inactiveUsers,
      deletedUsers,
      totalBlogs,
      draftBlogs,
      totalEvents,
      upcomingEvents,
      pastEvents,
      totalPrayers,
      totalLikes,
      totalBookmarks,
      totalNotifications
    };
  },

  // -----------------------------------------------------
  // ACTIVITY GRAPH (LAST 7 DAYS)
  // -----------------------------------------------------
  getActivity: async () => {
    const days = 7;
    const result = [];

    for (let i = 0; i < days; i++) {
      let dayStart = new Date();
      dayStart.setDate(dayStart.getDate() - i);
      dayStart.setHours(0, 0, 0, 0);

      let dayEnd = new Date();
      dayEnd.setDate(dayEnd.getDate() - i);
      dayEnd.setHours(23, 59, 59, 999);

      const [users, blogs, prayers, events] = await Promise.all([
        User.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } }),
        Blog.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } }),
        Prayer.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } }),
        Event.countDocuments({ createdAt: { $gte: dayStart, $lte: dayEnd } })
      ]);

      result.push({
        date: dayStart.toISOString().split("T")[0],
        users,
        blogs,
        prayers,
        events
      });
    }

    return result.reverse();
  },

  // -----------------------------------------------------
  // TRENDING SUMMARY (TOP BLOGS + TOP EVENTS)
  // -----------------------------------------------------
  getTrending: async () => {
    const trendingBlogs = await BlogTrendingService.getTrending(5);
    const trendingEvents = await Event.find()
      .sort({ attendeesCount: -1 })
      .limit(5);

    return {
      trendingBlogs,
      trendingEvents
    };
  },

  // -----------------------------------------------------
  // SYSTEM HEALTH
  // -----------------------------------------------------
  systemHealth: async () => {
    return {
      mongoStatus: mongoose.connection.readyState === 1 ? "connected" : "disconnected",
      uptime: process.uptime(),
      memory: process.memoryUsage()
    };
  }

};
