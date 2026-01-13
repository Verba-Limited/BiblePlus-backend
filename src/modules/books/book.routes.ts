import { Router } from "express";
import { BookController } from "./book.controller";
import { BookFavoriteController } from "./bookFavorite.controller";
import { BookProgressController } from "./bookProgress.controller";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import multer from "multer";

const upload = multer({ dest: "uploads/books" });
const router = Router();

/* ---------------------- PUBLIC ROUTES ---------------------- */
router.get("/", BookController.getBooks);
router.get("/search", BookController.search);
router.get("/:id", BookController.getBook);
router.get("/:id/chapters", BookController.getChapters);
router.get("/:id/chapter/:chapter", BookController.getChapter);

/* ---------------------- ADMIN ROUTES ---------------------- */
router.post(
  "/admin",
  adminOnly,
  upload.single("coverImage"),
  BookController.create
);

router.put(
  "/admin/:id",
  adminOnly,
  upload.single("coverImage"),
  BookController.update
);

router.delete(
  "/admin/:id",
  adminOnly,
  BookController.delete
);

/* ---------------------- FAVORITES ---------------------- */
router.post("/favorite/add", authMiddleware, BookFavoriteController.add);
router.post("/favorite/remove", authMiddleware, BookFavoriteController.remove);
router.get("/favorite/all", authMiddleware, BookFavoriteController.all);

/* ---------------------- PROGRESS ---------------------- */
router.post("/progress/update", authMiddleware, BookProgressController.update);
router.get("/progress/:bookId", authMiddleware, BookProgressController.get);

export default router;