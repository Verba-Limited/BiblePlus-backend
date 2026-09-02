import { Router } from "express";
import { BookController } from "./book.controller";
import { uploadBookCover } from "../../middleware/upload.middleware";

const router = Router();

/* ======================================================
   BOOK LIST (ADMIN)
   The portal reads its list from /api/admin/books; only
   the write routes lived here, so the list 404'd.
   Specific paths MUST stay above /:id.
====================================================== */
router.get("/search", BookController.search);
router.get("/", BookController.getBooks);

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

/* This MUST stay last — it matches anything left over */
router.get("/:id", BookController.getBook);

export default router;
