import { Router } from "express";
import { SpeakerController } from "./speaker.controller";
import { adminOnly } from "../../middleware/admin.middleware";

const router = Router();

/* ======================================================
   📌 PUBLIC SPEAKER ROUTES
====================================================== */
router.get("/", SpeakerController.getAll);
router.get("/:id", SpeakerController.getOne);

/* ======================================================
   📌 ADMIN SPEAKER ROUTES
   NOTE: NO authMiddleware here — adminOnly is enough
====================================================== */
router.post("/admin", adminOnly, SpeakerController.create);
router.put("/admin/:id", adminOnly, SpeakerController.update);
router.delete("/admin/:id", adminOnly, SpeakerController.delete);

export default router;
