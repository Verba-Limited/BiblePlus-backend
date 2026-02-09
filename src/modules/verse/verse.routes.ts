// src/modules/verse/verse.routes.ts
import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { VerseController } from "./verse.controller";
import { AdminVerseController } from "./admin.verse.controller";

const router = Router();

/* USER */
router.get("/today", VerseController.today);
router.get("/history", VerseController.history);

/* ADMIN */
router.post(
  "/admin/add",
  authMiddleware,
  adminOnly,
  AdminVerseController.addVerse
);

router.post(
  "/admin/set",
  authMiddleware,
  adminOnly,
  AdminVerseController.setVerseOfDay
);

export default router;