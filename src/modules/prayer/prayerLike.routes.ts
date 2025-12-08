import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { PrayerLikeController } from "./prayerLike.controller";

const router = Router();

// Pray for someone
router.post("/pray", authMiddleware, PrayerLikeController.pray);

// Remove prayer
router.post("/unpray", authMiddleware, PrayerLikeController.unpray);

// Check if user has prayed
router.get("/status", authMiddleware, PrayerLikeController.status);

// Get total pray count
router.get("/count/:prayerId", PrayerLikeController.count);

export default router;
