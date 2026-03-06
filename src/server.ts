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
  }
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

// Event reminder system
cron.schedule("* * * * *", async () => {
  try {
    console.log("⏳ Running Event Reminder Cron...");
    await EventReminderService.processReminders();
  } catch (err) {
    console.error("❌ Event Reminder Cron Failed:", err);
  }
});

// Verse of the day scheduler
startVerseScheduler();

// Daily quiz cleanup
startDailyQuizCleanup();

// -------------------------------
// DATABASE CONNECTION
// -------------------------------
async function startServer() {
  try {

    await mongoose.connect(MONGO_URI);

    console.log("✅ MongoDB Connected");

    // -----------------------------------------
    // INITIALIZE CORE SYSTEMS
    // -----------------------------------------

    // Load bible verse search index
    VerseFinder.init();

    // Ensure admin account exists
    await AdminService.createDefaultAdmin();

    // -----------------------------------------
    // START HTTP SERVER
    // -----------------------------------------
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
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
process.on("SIGINT", async () => {
  console.log("🛑 Shutting down server...");
  await mongoose.connection.close();
  process.exit(0);
});