import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { BlogBookmarkController } from "./blogBookmark.controller";

const router = Router();

router.post("/add", authMiddleware, BlogBookmarkController.add);
router.post("/remove", authMiddleware, BlogBookmarkController.remove);
router.get("/list", authMiddleware, BlogBookmarkController.list);
router.get("/status", authMiddleware, BlogBookmarkController.status);

export default router;
