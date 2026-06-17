import { Router } from "express";
import { BookController } from "./book.controller";
import { uploadBookCover } from "../../middleware/upload.middleware";

const router = Router();

router.post(
  "/",
  uploadBookCover, // ✅ Cloudinary upload
  BookController.create
);

router.put(
  "/:id",
  uploadBookCover, // ✅ Cloudinary upload
  BookController.update
);

router.delete(
  "/:id",
  BookController.delete
);

export default router;
