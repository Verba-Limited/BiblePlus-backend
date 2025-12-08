import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { SpeakerController } from "./speaker.controller";

const router = Router();

router.get("/", SpeakerController.getAll);
router.get("/:id", SpeakerController.getOne);
router.post("/", authMiddleware, SpeakerController.create);
router.put("/:id", authMiddleware, SpeakerController.update);
router.delete("/:id", authMiddleware, SpeakerController.delete);

export default router;
