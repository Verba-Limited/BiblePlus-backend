import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import multer from "multer";
import { PrayerController } from "./prayer.controller";
import { PrayerLikeController } from "./prayerLike.controller";

const upload = multer({ dest: "uploads/prayers" });
const router = Router();

/* =====================================
      PUBLIC PRAYER WALL
===================================== */
// GET /api/prayer/public
router.get("/public", PrayerController.getPublic);

/* =====================================
      USER PRAYER REQUESTS
===================================== */
// GET /api/prayer/mine
router.get("/mine", authMiddleware, PrayerController.getUserRequests);

/* =====================================
      CREATE PRAYER REQUEST
===================================== */
// POST /api/prayer
router.post(
  "/",
  authMiddleware,
  upload.single("image"),
  PrayerController.create
);

router.delete(
  "/:id",
  authMiddleware,
  PrayerController.deletePrayer
)

/* =====================================
      PRAYER LIKE SYSTEM
===================================== */

// User prays for a request
router.post(
  "/like/pray",
  authMiddleware,
  PrayerLikeController.pray
);

// Undo prayer
router.post(
  "/like/unpray",
  authMiddleware,
  PrayerLikeController.unpray
);

// Check if user prayed
router.get(
  "/like/status",
  authMiddleware,
  PrayerLikeController.status
);

// Get total prayer count (PUBLIC)
router.get(
  "/like/count/:prayerId",
  PrayerLikeController.count
);

/* =====================================
      ADMIN: DELETE ONLY
===================================== */
// DELETE /api/prayer/admin/:id
router.delete(
  "/admin/:id",
  authMiddleware,
  adminOnly,
  PrayerController.delete
);

export default router;