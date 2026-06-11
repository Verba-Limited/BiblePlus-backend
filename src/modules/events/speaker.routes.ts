import { Router } from "express";
import { SpeakerController } from "./speaker.controller";
import { adminOnly } from "../../middleware/admin.middleware";
import authMiddleware from "../../middleware/auth.middleware";

const router = Router();

/* ======================================================
   📌 PUBLIC SPEAKER ROUTES
====================================================== */
router.get("/", SpeakerController.getAll);
router.get("/:id", SpeakerController.getOne);

/* ======================================================
   📌 ADMIN SPEAKER ROUTES
====================================================== */
router.post("/admin", authMiddleware, adminOnly, SpeakerController.create);
router.put("/admin/:id", authMiddleware, adminOnly, SpeakerController.update);
router.delete("/admin/:id", authMiddleware, adminOnly, SpeakerController.delete);

export default router;
