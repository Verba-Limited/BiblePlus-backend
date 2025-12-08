import { Router } from "express";
import { BibleController } from "./bible.controller";

const router = Router();

// Get list of books (KJV/ASV/WEB)
router.get("/books", BibleController.getBooks);

// Get verses from a book/chapter/version
router.get("/verses", BibleController.getVerses);

export default router;
