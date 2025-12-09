import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import multer from "multer";
import { PrayerController } from "./prayer.controller";
import { PrayerLikeController } from "./prayerLike.controller";

const upload = multer({ dest: "uploads/prayers" });
const router = Router();

/* ============================
      PUBLIC PRAYER WALL
============================= */
router.get("/public", PrayerController.getPublic);

/* ============================
      USER PRAYER REQUESTS
============================= */
router.get("/mine", authMiddleware, PrayerController.getUserRequests);

/* ============================
      CREATE PRAYER REQUEST
============================= */
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  PrayerController.create
);

/* ============================
      PRAYER LIKE SYSTEM
============================= */
// User prays for a request
router.post("/like/pray", authMiddleware, PrayerLikeController.pray);

// Undo prayer
router.post("/like/unpray", authMiddleware, PrayerLikeController.unpray);

// Check if user prayed
router.get("/like/status", authMiddleware, PrayerLikeController.status);

// Get total prayer count (public)
router.get("/like/count/:prayerId", PrayerLikeController.count);

/* ============================
          ADMIN ACTIONS
============================= */
router.put(
  "/:id/approve",
  authMiddleware,
  adminOnly,
  PrayerController.approve
);

router.put(
  "/:id/answered",
  authMiddleware,
  adminOnly,
  PrayerController.markAnswered
);

// OPTIONAL: Allow admin to delete a prayer (recommended)
router.delete(
  "/:id",
  authMiddleware,
  adminOnly,
  PrayerController.delete
);

export default router;
