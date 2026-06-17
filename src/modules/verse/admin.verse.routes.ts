// src/modules/verse/admin.verse.routes.ts
import { Router } from "express";
import { AdminVerseController } from "./admin.verse.controller";

const router = Router();

router.post("/set", AdminVerseController.setVerseOfDay);

export default router;
