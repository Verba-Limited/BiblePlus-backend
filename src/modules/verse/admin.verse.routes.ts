// src/modules/verse/admin.verse.routes.ts
import { Router } from "express";
import { AdminVerseController } from "./admin.verse.controller";

const router = Router();

/* ======================================================
   VERSE OF THE DAY — ADMIN
====================================================== */

// Backs the editor's "Load sample" button
router.get("/sample", AdminVerseController.loadSample);

// Preview section — today by default, or ?date=YYYY-MM-DD
router.get("/preview", AdminVerseController.preview);

router.get("/history", AdminVerseController.history);

router.post("/set", AdminVerseController.setVerseOfDay);

export default router;
