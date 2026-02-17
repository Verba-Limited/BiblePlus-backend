import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { UserXpController } from "./userXp.controller";

const router = Router();

router.get("/ranking", UserXpController.ranking);
router.get("/me", authMiddleware, UserXpController.profile);

export default router;