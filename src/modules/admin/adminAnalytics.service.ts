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
    // `attendeesCount` is not a field on the Event schema, so this
    // sort was a no-op and returned an arbitrary five events.
    // Soonest upcoming is what the dashboard actually wants.
    const trendingEvents = await Event.find({ startDate: { $gte: new Date() } })
      .sort({ startDate: 1 })
      .limit(5);

    return {
      trendingBlogs,
      trendingEvents
    };
  },

  // -----------------------------------------------------
  // MERGED DASHBOARD
  //
  // Overview and Analytics are being combined into a single
  // page, so serve the whole thing in one request.
  //
  // Each section is resolved independently: if one query
  // fails, that section reports an error and the rest of the
  // page still renders, instead of the whole endpoint 500ing
  // and leaving the dashboard blank.
  // -----------------------------------------------------
  getDashboard: async () => {
    const section = async <T>(name: string, fn: () => Promise<T>) => {
      try {
        return { ok: true as const, data: await fn() };
      } catch (err: any) {
        console.error(`⚠️  Dashboard section "${name}" failed:`, err?.message);
        return { ok: false as const, error: err?.message || "Failed to load" };
      }
    };

    const [overview, activity, trending, health] = await Promise.all([
      section("overview", () => AdminAnalyticsService.getOverview()),
      section("activity", () => AdminAnalyticsService.getActivity()),
      section("trending", () => AdminAnalyticsService.getTrending()),
      section("health", () => AdminAnalyticsService.systemHealth())
    ]);

    const failed = [
      ["overview", overview],
      ["activity", activity],
      ["trending", trending],
      ["health", health]
    ]
      .filter(([, r]: any) => !r.ok)
      .map(([name]) => name as string);

    return {
      overview: overview.ok ? overview.data : null,
      activity: activity.ok ? activity.data : [],
      trending: trending.ok ? trending.data : null,
      systemHealth: health.ok ? health.data : null,
      degraded: failed.length > 0,
      failedSections: failed
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
