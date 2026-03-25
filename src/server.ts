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
import { seedDevtoBlogs, refreshDevtoBlogs } from "./modules/blog/devto.service";

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
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"]
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

// ✅ Refresh Dev.to blogs every 24 hours at midnight
cron.schedule("0 0 * * *", async () => {
  try {
    console.log("🔄 Daily blog refresh...");
    await refreshDevtoBlogs();
  } catch (err) {
    console.error("❌ Blog refresh failed:", err);
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

        console.log("✅ All systems initialized");

        // ✅ Low priority seeds — run 5s after startup
        // so they don't compete with real user requests
        setTimeout(() => {
          seedGutenbergBooks().catch(console.error);
        }, 5000);

        // ✅ Blog seed runs 10s after startup
        // after Gutenberg to avoid overwhelming DB on cold start
        setTimeout(() => {
          seedDevtoBlogs().catch(console.error);
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