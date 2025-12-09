import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { SpeakerController } from "./speaker.controller";

const router = Router();

// PUBLIC ROUTES
router.get("/", SpeakerController.getAll);
router.get("/:id", SpeakerController.getOne);

// ADMIN ROUTES
router.post("/", authMiddleware, adminOnly, SpeakerController.create);
router.put("/:id", authMiddleware, adminOnly, SpeakerController.update);
router.delete("/:id", authMiddleware, adminOnly, SpeakerController.delete);

export default router;
