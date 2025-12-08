import { Router } from "express";
import multer from "multer";
import authMiddleware from "../../../middleware/auth.middleware";
import { EventGalleryController } from "./eventGallery.controller";

const upload = multer({ dest: "uploads/events/gallery" }); // folder for gallery

const router = Router();

// Upload multiple images
router.post(
  "/upload",
  authMiddleware,
  upload.array("images", 10),  // up to 10 images
  EventGalleryController.upload
);

// Get all gallery images for an event
router.get("/:eventId", EventGalleryController.list);

// Delete a gallery image
router.delete("/:id", authMiddleware, EventGalleryController.delete);

export default router;
