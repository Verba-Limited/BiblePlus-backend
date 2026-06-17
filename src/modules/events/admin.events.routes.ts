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
      url: `/uploads/events/banners/${req.file.filename}`,
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
        url: `/uploads/events/gallery/${f.filename}`,
      })),
    });
  }
);

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

export default router;
