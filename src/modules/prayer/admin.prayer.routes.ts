import { Router } from "express";
import { PrayerController } from "./prayer.controller";

const router = Router();

// ADMIN: DELETE ONLY
router.delete("/:id", PrayerController.delete);

export default router;
