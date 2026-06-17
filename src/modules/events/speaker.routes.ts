import { Router } from "express";
import { SpeakerController } from "./speaker.controller";
import authMiddleware from "../../middleware/auth.middleware";

const router = Router();

/* ======================================================
   📌 PUBLIC SPEAKER ROUTES
====================================================== */
router.get("/", SpeakerController.getAll);
router.get("/:id", SpeakerController.getOne);

export default router;
