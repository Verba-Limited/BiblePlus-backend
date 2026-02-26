import dotenv from "dotenv";
dotenv.config(); 

import { app } from "./app";
import mongoose from "mongoose";

import cron from "node-cron";
import { Server } from "socket.io";
import http from "http";

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
  cors: { origin: "*" }
});

// Initialize socket notify system
SocketNotify.init(io);

// Handle socket events
io.on("connection", (socket) => {
  console.log("🔥 User connected:", socket.id);

  socket.on("register", (userId: string) => {
    if (!userId) return;

    socket.join(userId);
    console.log(`📌 User ${userId} joined room`);
  });

  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// -------------------------------
// CRON: EVENT REMINDER ENGINE
// Runs every 1 minute
// -------------------------------
cron.schedule("* * * * *", async () => {
  console.log("⏳ Running Event Reminder Cron...");
  await EventReminderService.processReminders();
});

startVerseScheduler();

// -------------------------------
// CONNECT TO MONGO DB
// -------------------------------
mongoose
  .connect(MONGO_URI)
  .then(async () => {
    console.log("✅ MongoDB Connected");

    // -----------------------------------------
    // INITIALIZE SYSTEM MODULES
    // -----------------------------------------

    // 🟣 1. Load BibleVerse index for Chatbot
    VerseFinder.init();

    // 🟢 2. Create default admin IF missing
    await AdminService.createDefaultAdmin();

    startDailyQuizCleanup();

    // -----------------------------------------
    // START SERVER
    // -----------------------------------------
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  });
