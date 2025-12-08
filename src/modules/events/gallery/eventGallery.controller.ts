import { Request, Response, NextFunction } from "express";
import { EventGalleryService } from "./eventGallery.service";

export const EventGalleryController = {
  upload: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { eventId } = req.body;

      if (!req.files || !Array.isArray(req.files)) {
        return res.status(400).json({
          success: false,
          message: "No files uploaded"
        });
      }

      const data = await EventGalleryService.uploadImages(
        eventId,
        req.files as Express.Multer.File[]
      );

      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const images = await EventGalleryService.getImages(req.params.eventId);
      res.json({ success: true, data: images });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const deleted = await EventGalleryService.deleteImage(req.params.id);
      res.json({ success: true, message: "Image deleted", data: deleted });
    } catch (err) {
      next(err);
    }
  }
};
