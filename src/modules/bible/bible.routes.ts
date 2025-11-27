import { Router } from "express";
import { BibleController } from "./bible.controller";
import authMiddleware from "../../middleware/auth.middleware";

const router = Router();

router.get("/books", BibleController.getBooks);
router.get("/verses", BibleController.getVerses);

router.post("/highlight", authMiddleware, BibleController.highlight);
router.get("/highlights", authMiddleware, BibleController.getHighlights);

export default router;
