import dotenv from "dotenv";
dotenv.config();

import { app } from "./app";
import mongoose from "mongoose";
import http from "http";
import { Server } from "socket.io";
import cron from "node-cron";

import { SocketNotify } from "./modules/notifications/socketNotify";
import { EventReminderService } from "./modules/events/eventReminder.service";
import { AdminService } from "./modules/admin/admin.service";
import { VerseFinder } from "./modules/chatbot/helpers/verseFinder";

import { startVerseScheduler } from "./modules/verse/verse.schedular";
import { startDailyQuizCleanup } from "./jobs/QuizCleanup";
import { seedGutenbergBooks } from "./modules/books/gutenberg.service";
import { seedChristianBlogs, refreshChristianBlogs } from "./modules/blog/christainBlog.service";
import { EmailService } from "./services/email.service";
import { VerseService } from "./modules/verse/verse.service";
import { seedDefaultConfigs, getConfigBool } from "./modules/admin/system/systemConfig.model";

const PORT = process.env.PORT || 5001;
const MONGO_URI = process.env.MONGO_URI as string;

// -------------------------------
// CREATE HTTP SERVER
// -------------------------------
const server = http.createServer(app);

// -------------------------------
// SOCKET.IO INITIALIZATION
// -------------------------------
export const io = new Server(server, {
  cors: {
    origin: process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(",")
      : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
  transports: ["websocket", "polling"],
  pingTimeout: 60000,
  pingInterval: 25000,
});

SocketNotify.init(io);

// -------------------------------
// SOCKET EVENTS
// -------------------------------
io.on("connection", (socket) => {
  console.log("🔥 Socket connected:", socket.id);

  socket.on("register", (userId: string) => {
    if (!userId) return;
    socket.join(userId);
    console.log(`📌 User joined notification room: ${userId}`);
  });

  socket.on("disconnect", () => {
    console.log("❌ Socket disconnected:", socket.id);
  });
});

// -------------------------------
// CRON JOBS
// -------------------------------

// ✅ Event reminder — every minute
cron.schedule("* * * * *", async () => {
  try {
    console.log("⏳ Running Event Reminder Cron...");
    await EventReminderService.processReminders();
  } catch (err) {
    console.error("❌ Event Reminder Cron Failed:", err);
  }
});

// ✅ Refresh Christian blogs every 24 hours at midnight (respects feature flag)
cron.schedule("0 0 * * *", async () => {
  try {
    const enabled = await getConfigBool("rss_sync_enabled", true);
    if (!enabled) {
      console.log("⏭️  RSS sync disabled via SystemConfig — skipping");
      return;
    }
    console.log("🔄 Daily Christian blog refresh...");
    await refreshChristianBlogs();
  } catch (err) {
    console.error("❌ Blog refresh failed:", err);
  }
});

// ✅ Verse of the day email — every day at 7am
cron.schedule("0 7 * * *", async () => {
  try {
    console.log("📖 Sending verse of the day emails...");
    const verse = await VerseService.getToday();
    if (!verse) return;

    await EmailService.sendToAllUsers(
      "📖 Your Verse of the Day",
      (firstName) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #6B4EFF; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white;">✨ Verse of the Day</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Good morning, ${firstName}! 🌅</h2>
            <div style="background: white; border-left: 4px solid #6B4EFF; padding: 20px; border-radius: 5px;">
              <p style="font-size: 18px; font-style: italic;">"${verse.text}"</p>
              <p style="color: #6B4EFF; font-weight: bold;">— ${verse.reference}</p>
            </div>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}" style="background: #6B4EFF; color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none;">Open BiblePlus</a>
            </div>
          </div>
        </div>
      `
    );
  } catch (err) {
    console.error("❌ Verse email cron failed:", err);
  }
});

// ✅ Daily quiz reminder — every day at 9am
cron.schedule("0 9 * * *", async () => {
  try {
    console.log("🎯 Sending quiz reminder emails...");
    await EmailService.sendToAllUsers(
      "🎯 Your Daily Bible Quiz is Ready!",
      (firstName) => `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #6B4EFF; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white;">Daily Quiz Time! 🎯</h1>
          </div>
          <div style="padding: 30px; background: #f9f9f9;">
            <h2>Hello ${firstName}!</h2>
            <p>Your daily Bible quiz is ready. Test your knowledge and earn XP!</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.APP_URL}/quiz" style="background: #6B4EFF; color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none;">Take Quiz Now</a>
            </div>
          </div>
        </div>
      `
    );
  } catch (err) {
    console.error("❌ Quiz email cron failed:", err);
  }
});

// -------------------------------
// DATABASE CONNECTION
// -------------------------------
async function startServer() {
  try {
    mongoose.set("strictQuery", true);

    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Connected");

    // ✅ Start server immediately so health checks pass
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // ✅ Run inits after server is listening — non-blocking
    setImmediate(async () => {
      try {
        // Fast inits first
        VerseFinder.init();
        startVerseScheduler();
        startDailyQuizCleanup();

        // Needs DB
        await AdminService.createDefaultAdmin();
        await seedDefaultConfigs();

        console.log("✅ All systems initialized");

        // ✅ Gutenberg books — 5s after startup
        setTimeout(() => {
          seedGutenbergBooks().catch(console.error);
        }, 5000);

        // ✅ Christian blogs — 10s after startup (respects feature flag)
        // staggered so they don't hit DB at the same time
        setTimeout(async () => {
          const rssEnabled = await getConfigBool("rss_sync_enabled", true);
          if (rssEnabled) {
            seedChristianBlogs().catch(console.error);
          } else {
            console.log("⏭️  RSS sync disabled — skipping initial seed");
          }
        }, 10000);

      } catch (err) {
        console.error("❌ Initialization error:", err);
      }
    });

  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
}

startServer();

// -------------------------------
// GRACEFUL SHUTDOWN
// -------------------------------
process.on("SIGTERM", async () => {
  console.log("🛑 SIGTERM received — shutting down gracefully...");
  await mongoose.connection.close();
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

process.on("SIGINT", async () => {
  console.log("🛑 SIGINT received — shutting down...");
  await mongoose.connection.close();
  server.close(() => {
    console.log("✅ Server closed");
    process.exit(0);
  });
});

// ✅ Catch unhandled errors so server doesn't crash
process.on("unhandledRejection", (reason) => {
  console.error("❌ Unhandled Rejection:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  process.exit(1);
});