import { Router } from "express";
import { EventController } from "./event.controller";
import multer from "multer";

/* Uploads */
const bannerUpload = multer({ dest: "uploads/events/banners" });
const galleryUpload = multer({ dest: "uploads/events/gallery" });

const router = Router();

/* ======================================================
    📌 EVENT BANNER UPLOAD (ADMIN ONLY)
====================================================== */
router.post(
  "/upload-banner",
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
      url: `${req.protocol}://${req.get("host")}/uploads/events/banners/${req.file.filename}`,
    });
  }
);

/* ======================================================
    📌 EVENT GALLERY UPLOAD (ADMIN ONLY)
====================================================== */
router.post(
  "/gallery/upload",
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
        url: `${req.protocol}://${req.get("host")}/uploads/events/gallery/${f.filename}`,
      })),
    });
  }
);

/* ======================================================
    📌 EVENT LISTS (ADMIN ONLY)

    The admin portal calls /api/admin/events for its list,
    search and past/upcoming tabs. Only the write routes
    existed here, so every one of those reads 404'd.

    Specific paths MUST stay above /:id.
====================================================== */
router.get("/search", EventController.search);
router.get("/upcoming", EventController.upcoming);
router.get("/past", EventController.past);
router.get("/", EventController.getEvents);

/* ======================================================
    📌 LIVESTREAM UPDATE (ADMIN ONLY)
====================================================== */
router.put("/:id/live", EventController.updateLiveStream);

/* ======================================================
    📌 EVENT CRUD (ADMIN ONLY)
====================================================== */
router.post("/", EventController.create);
router.put("/:id", EventController.update);
router.delete("/:id", EventController.delete);

/* This MUST stay last — it matches anything left over */
router.get("/:id", EventController.getEvent);

export default router;
