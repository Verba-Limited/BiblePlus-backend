import { Router } from "express";
import { SpeakerController } from "./speaker.controller";

const router = Router();

/* ======================================================
   📌 ADMIN SPEAKER ROUTES
====================================================== */
router.post("/", SpeakerController.create);
router.put("/:id", SpeakerController.update);
router.delete("/:id", SpeakerController.delete);

export default router;
