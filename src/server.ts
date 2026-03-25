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
  // ✅ Performance — use websocket first, fallback to polling
  transports: ["websocket", "polling"],
  // ✅ Reduce ping overhead
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Initialize notification system
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

// -------------------------------
// DATABASE CONNECTION
// -------------------------------
async function startServer() {
  try {
    // ✅ Mongoose performance settings
    mongoose.set("strictQuery", true);

    await mongoose.connect(MONGO_URI, {
      maxPoolSize: 10,        // ✅ connection pool for concurrent requests
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
    });

    console.log("✅ MongoDB Connected");

    // ✅ Start HTTP server immediately after DB connects
    // so health checks pass right away
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });

    // ✅ Run all initializations AFTER server is listening
    // so the server doesn't block on startup tasks
    setImmediate(async () => {
      try {
        // Fast inits first
        VerseFinder.init();
        startVerseScheduler();
        startDailyQuizCleanup();

        // Admin check — needs DB
        await AdminService.createDefaultAdmin();

        // ✅ Gutenberg seed last — lowest priority, runs 5s after startup
        setTimeout(() => {
          seedGutenbergBooks().catch(console.error);
        }, 5000);

        console.log("✅ All systems initialized");
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