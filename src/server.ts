import app from "./app";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cron from "node-cron";
import { Server } from "socket.io";
import http from "http";
import { SocketNotify } from "./modules/notifications/socketNotify";
import { EventReminderService } from "./modules/events/eventReminder.service";

dotenv.config();

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI as string;


// -------------------------------
// CREATE HTTP SERVER
// -------------------------------
const server = http.createServer(app);

// -------------------------------
// INITIALIZE SOCKET.IO
// -------------------------------
export const io = new Server(server, {
  cors: { origin: "*" }
});

// Initialize our Notification WebSocket System
SocketNotify.init(io);

// Handle connections
io.on("connection", (socket) => {
  console.log("🔥 User connected:", socket.id);

  // Client registers userId → join user room
  socket.on("register", (userId: string) => {
    if (!userId) return;

    socket.join(userId);
    console.log(`📌 User ${userId} joined their private room`);
  });

  // Disconnect event
  socket.on("disconnect", () => {
    console.log("❌ User disconnected:", socket.id);
  });
});

// notification
cron.schedule("* * * * *", async () => {
  console.log("🕒 Running Event Reminder Cron...");
  await EventReminderService.processReminders();
});

// -------------------------------
// CONNECT TO MONGO DB
// -------------------------------
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");

    // Start server
    server.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  });
