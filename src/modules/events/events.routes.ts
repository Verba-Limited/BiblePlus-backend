import { Router } from "express";
import { EventController } from "./event.controller";
import { EventReminderController } from "./eventReminder.controller";
import { SpeakerController } from "./speaker.controller";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import multer from "multer";

/* Uploads */
const bannerUpload = multer({ dest: "uploads/events/banners" });
const galleryUpload = multer({ dest: "uploads/events/gallery" });

const router = Router();

/* ======================================================
    📌 PUBLIC EVENT ROUTES  (NO AUTH)
====================================================== */
router.get("/", EventController.getEvents);
router.get("/upcoming", EventController.upcoming);
router.get("/past", EventController.past);
router.get("/search", EventController.search);

/* MUST COME BEFORE /:id TO AVOID ROUTE COLLISION */
router.get("/speakers", SpeakerController.getAll);
router.get("/speakers/:id", SpeakerController.getOne);

/* This MUST stay last among public routes */
router.get("/:id", EventController.getEvent);

/* ======================================================
    📌 USER REMINDERS (USER AUTH)
====================================================== */
router.post("/reminders/add", authMiddleware, EventReminderController.add);
router.post("/reminders/remove", authMiddleware, EventReminderController.remove);
router.get("/reminders/all", authMiddleware, EventReminderController.all);
router.get("/:id/remind",   authMiddleware, EventReminderController.remindMe);

/* ======================================================
    📌 SPEAKER MANAGEMENT (ADMIN ONLY)
====================================================== */
router.post("/admin/speakers", adminOnly, SpeakerController.create);
router.put("/admin/speakers/:id", adminOnly, SpeakerController.update);
router.delete("/admin/speakers/:id", adminOnly, SpeakerController.delete);

/* ======================================================
    📌 EVENT BANNER UPLOAD (ADMIN ONLY)
====================================================== */
router.post(
  "/admin/upload-banner",
  adminOnly,
  bannerUpload.single("banner"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No banner uploaded",
      });
    }

    res.json({
      success: true,
      file: req.file.filename,
      url: `/uploads/events/banners/${req.file.filename}`,
    });
  }
);

/* ======================================================
    📌 EVENT GALLERY UPLOAD (ADMIN ONLY)
====================================================== */
router.post(
  "/admin/gallery/upload",
  adminOnly,
  galleryUpload.array("images", 10),
  (req, res) => {
    const files = req.files as Express.Multer.File[];
    if (!files?.length) {
      return res.status(400).json({
        success: false,
        message: "No images uploaded",
      });
    }

    res.json({
      success: true,
      images: files.map((f) => ({
        file: f.filename,
        url: `/uploads/events/gallery/${f.filename}`,
      })),
    });
  }
);

/* ======================================================
    📌 LIVESTREAM UPDATE (ADMIN ONLY)
====================================================== */
router.put("/admin/:id/live", adminOnly, EventController.updateLiveStream);

/* ======================================================
    📌 EVENT CRUD (ADMIN ONLY)
====================================================== */
router.post("/admin", adminOnly, EventController.create);
router.put("/admin/:id", adminOnly, EventController.update);
router.delete("/admin/:id", adminOnly, EventController.delete);

export default router;
