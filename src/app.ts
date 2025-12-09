import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { errorHandler } from "./middleware/error.middleware";

import authRoutes from "./modules/auth/auth.routes";
import bibleRoutes from "./modules/bible/bible.routes";
import highlightRoutes from "./modules/bible/highlight.routes";
import quizRoutes from "./modules/quiz/quiz.routes";
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
import { BibleLoader } from "./modules/bible/bible.loader";
import AdminRoutes from "./modules/admin/admin.routes";

dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/bible", bibleRoutes);
app.use("/api/highlights", highlightRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/books", bookRoutes);

app.use("/api/events", eventRoutes);
app.use("/api/speakers", speakerRoutes);
app.use("/api/event-categories", eventCategoryRoutes);
app.use("/api/events/attendance", eventAttendanceRoutes);
app.use("/api/events/comments", eventCommentRoutes);
app.use("/api/events/gallery", eventGalleryRoutes);

app.use("/api/blog", blogRoutes);
app.use("/api/blog/bookmark", blogBookmarkRoutes);
app.use("/api/blog/trending", blogTrendingRoutes);


app.use("/api/prayer/likes", prayerLikeRoutes);
app.use("/api/prayer", prayerRoutes);
app.use("/api/admin", AdminRoutes);

app.use("/api/notifications", notificationRoutes);
BibleLoader.load();

// Test route
app.get("/", (req, res) => {
  res.json({ message: "BiblePlus API is running..." });
});

// Error Handler
app.use(errorHandler);

export default app;
