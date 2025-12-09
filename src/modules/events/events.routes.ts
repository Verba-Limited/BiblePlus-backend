import { Router } from "express";
import { EventController } from "./event.controller";
import { EventReminderController } from "./eventReminder.controller";
import { SpeakerController } from "./speaker.controller";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import multer from "multer";

/* ==========================================
   UPLOAD HANDLERS
========================================== */
const bannerUpload = multer({ dest: "uploads/events/banners" });
const galleryUpload = multer({ dest: "uploads/events/gallery" });

const router = Router();

/* ==========================================
   PUBLIC EVENT ROUTES
========================================== */
router.get("/", EventController.getEvents);
router.get("/upcoming", EventController.upcoming);
router.get("/past", EventController.past);
router.get("/search", EventController.search);

// IMPORTANT: This stays LAST in public routes
router.get("/:id", EventController.getEvent);

/* ==========================================
   USER REMINDERS (NOT ADMIN)
========================================== */
router.post("/reminders/add", authMiddleware, EventReminderController.add);
router.post("/reminders/remove", authMiddleware, EventReminderController.remove);
router.get("/reminders/all", authMiddleware, EventReminderController.all);

/* ==========================================
   SPEAKER MANAGEMENT (ADMIN ONLY)
========================================== */
router.post("/speakers", authMiddleware, adminOnly, SpeakerController.create);
router.put("/speakers/:id", authMiddleware, adminOnly, SpeakerController.update);
router.delete("/speakers/:id", authMiddleware, adminOnly, SpeakerController.delete);

// Public Speaker list
router.get("/speakers", SpeakerController.getAll);
router.get("/speakers/:id", SpeakerController.getOne);

/* ==========================================
   EVENT BANNER UPLOAD (ADMIN ONLY)
========================================== */
router.post(
  "/upload-banner",
  authMiddleware,
  adminOnly,
  bannerUpload.single("banner"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No banner uploaded"
      });
    }

    res.json({
      success: true,
      file: req.file.filename,
      url: `/uploads/events/banners/${req.file.filename}`
    });
  }
);

/* ==========================================
   EVENT GALLERY UPLOAD (ADMIN ONLY)
========================================== */
router.post(
  "/gallery/upload",
  authMiddleware,
  adminOnly,
  galleryUpload.array("images", 10),
  (req, res) => {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded"
      });
    }

    res.json({
      success: true,
      images: files.map((f) => ({
        file: f.filename,
        url: `/uploads/events/gallery/${f.filename}`
      }))
    });
  }
);

/* ==========================================
   LIVESTREAM UPDATE (ADMIN ONLY)
========================================== */
router.put("/:id/live", authMiddleware, adminOnly, EventController.updateLiveStream);

/* ==========================================
   EVENT CRUD (ADMIN ONLY)
========================================== */
router.post("/", authMiddleware, adminOnly, EventController.create);
router.put("/:id", authMiddleware, adminOnly, EventController.update);
router.delete("/:id", authMiddleware, adminOnly, EventController.delete);

export default router;
