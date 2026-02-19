import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import helmet from "helmet";
import path from "path";
import { errorHandler } from "./middleware/error.middleware";

/* =====================
   ROUTES
===================== */
import authRoutes from "./modules/auth/auth.routes";
import profileRoutes from "./modules/profile/profile.routes";
import profileStatsRoutes from "./modules/profile/profile.stats.routes";

import bibleRoutes from "./modules/bible/bible.routes";
import highlightRoutes from "./modules/bible/highlight.routes";

import quizRoutes from "./modules/quiz/quiz.routes";
import quizDailyRoutes from "./modules/quiz/quizDaily.routes";
import quizLeaderboardRoutes from "./modules/quiz/quizLeaderboard.routes";
import bookRoutes from "./modules/books/book.routes";

import eventRoutes from "./modules/events/events.routes";
import speakerRoutes from "./modules/events/speaker.routes";
import eventCategoryRoutes from "./modules/events/categories/eventCategory.routes";
import eventAttendanceRoutes from "./modules/events/attendance/eventAttendance.routes";
import eventCommentRoutes from "./modules/events/comments/eventComment.routes";
import eventGalleryRoutes from "./modules/events/gallery/eventGallery.routes";

import blogRoutes from "./modules/blog/blog.routes";
import blogBookmarkRoutes from "./modules/blog/blogBookmark.routes";
import blogTrendingRoutes from "./modules/blog/blogTrending.routes";

import prayerLikeRoutes from "./modules/prayer/prayerLike.routes";
import prayerRoutes from "./modules/prayer/prayer.routes";

import notificationRoutes from "./modules/notifications/notification.routes";
import AdminRoutes from "./modules/admin/admin.routes";
import chatbotRoutes from "./modules/chatbot/chatbot.routes";
import verseRoutes from "./modules/verse/verse.routes";


/* =====================
   LOADERS
===================== */
import { BibleLoader } from "./modules/bible/bible.loader";
import { QuizLoader } from "./modules/quiz/quiz.loader";

dotenv.config();

const app = express();

/* =====================
   GLOBAL MIDDLEWARES
===================== */
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

/* =====================
   STATIC FILES
===================== */
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

/* =====================
   API ROUTES
===================== */
app.use("/api/auth", authRoutes);

app.use("/api/profile", profileRoutes);
app.use("/api/profile/stats", profileStatsRoutes);

app.use("/api/bible", bibleRoutes);
app.use("/api/highlights", highlightRoutes);

/* ===== QUIZ ===== */
app.use("/api/quiz", quizRoutes);               
app.use("/api/quiz/daily", quizDailyRoutes);
app.use("/api/quiz/leaderboard", quizLeaderboardRoutes);

app.use("/api/books", bookRoutes);

/* ===== EVENTS ===== */
app.use("/api/events", eventRoutes);
app.use("/api/speakers", speakerRoutes);
app.use("/api/event-categories", eventCategoryRoutes);
app.use("/api/events/attendance", eventAttendanceRoutes);
app.use("/api/events/comments", eventCommentRoutes);
app.use("/api/events/gallery", eventGalleryRoutes);

/* ===== BLOG ===== */
app.use("/api/blog", blogRoutes);
app.use("/api/verse", verseRoutes);
app.use("/api/blog/bookmark", blogBookmarkRoutes);
app.use("/api/blog/trending", blogTrendingRoutes);

/* ===== PRAYERS ===== */
app.use("/api/prayer/likes", prayerLikeRoutes);
app.use("/api/prayer", prayerRoutes);

/* ===== ADMIN CORE ===== */
app.use("/api/admin", AdminRoutes);

/* ===== OTHER ===== */
app.use("/api/notifications", notificationRoutes);
app.use("/api/chatbot", chatbotRoutes);

/* =====================
   LOAD DATA
===================== */
BibleLoader.load();
QuizLoader.load();

/* =====================
   HEALTH
===================== */
app.get("/", (_req, res) => {
  res.json({ message: "BiblePlus API is running 🚀" });
});

app.get("/health", (_req, res) => {
  res.status(200).send("OK");
});

/* =====================
   ERROR HANDLER
===================== */
app.use(errorHandler);

export default app;