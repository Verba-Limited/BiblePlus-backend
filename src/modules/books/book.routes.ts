import { Router } from "express";
import { BookController } from "./book.controller";
import { BookFavoriteController } from "./bookFavorite.controller";
import { BookProgressController } from "./bookProgress.controller";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { uploadBookCover } from "../../middleware/upload.middleware";

const router = Router();

/* ---------------------- PUBLIC ROUTES ---------------------- */
router.get("/", BookController.getBooks);
router.get("/search", BookController.search); // ✅ must be before /:id

/* ---------------------- FAVORITES ---------------------- */
// ✅ must be before /:id or "favorite" gets matched as an id
router.post("/favorite/add", authMiddleware, BookFavoriteController.add);
router.post("/favorite/remove", authMiddleware, BookFavoriteController.remove);
router.get("/favorite/all", authMiddleware, BookFavoriteController.all);

/* ---------------------- PROGRESS ---------------------- */
// ✅ must be before /:id
router.post("/progress/update", authMiddleware, BookProgressController.update);
router.get("/progress/:bookId", authMiddleware, BookProgressController.get);

/* ---------------------- BOOK ROUTES ---------------------- */
router.get("/:id", BookController.getBook);
router.get("/:id/chapters", BookController.getChapters);
router.get("/:id/chapter/:chapter", BookController.getChapter);

/* ---------------------- ADMIN ROUTES ---------------------- */
router.post(
  "/admin",
  authMiddleware,
  adminOnly,
  uploadBookCover, // ✅ Cloudinary upload
  BookController.create
);

router.put(
  "/admin/:id",
  authMiddleware,
  adminOnly,
  uploadBookCover, // ✅ Cloudinary upload
  BookController.update
);

router.delete(
  "/admin/:id",
  authMiddleware,
  adminOnly,
  BookController.delete
);

export default router;