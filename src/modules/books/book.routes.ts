import { Router } from "express";
import { BookController } from "./book.controller";
import { BookFavoriteController } from "./bookFavorite.controller";
import { BookProgressController } from "./bookProgress.controller";
import authMiddleware from "../../middleware/auth.middleware";
import multer from "multer";

// File upload storage (PDF / EPUB)
const upload = multer({ dest: "uploads/books" });

const router = Router();

/* ---------------------- BOOK BASIC ROUTES ---------------------- */
router.get("/", BookController.getBooks);
router.get("/search", BookController.search);
router.get("/:id", BookController.getBook);
router.get("/:id/chapters", BookController.getChapters);
router.get("/:id/chapter/:chapter", BookController.getChapter);

/* ------------------------ FAVORITE ROUTES ----------------------- */
router.post("/favorite/add", authMiddleware, BookFavoriteController.add);
router.post("/favorite/remove", authMiddleware, BookFavoriteController.remove);
router.get("/favorite/all", authMiddleware, BookFavoriteController.all);

/* --------------------- READING PROGRESS ROUTES ------------------ */
router.post("/progress/update", authMiddleware, BookProgressController.update);
router.get("/progress/:bookId", authMiddleware, BookProgressController.get);

/* -------------------------- FILE UPLOAD -------------------------- */
// Upload a PDF or EPUB for a book
router.post(
  "/upload",
  authMiddleware,
  upload.single("file"),
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded"
      });
    }

    res.json({
      success: true,
      message: "File uploaded",
      file: req.file.filename,
      url: `/uploads/books/${req.file.filename}`
    });
  }
);

export default router;
