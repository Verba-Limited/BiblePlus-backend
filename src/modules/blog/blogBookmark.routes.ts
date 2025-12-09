import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { BlogBookmarkController } from "./blogBookmark.controller";

const router = Router();

// User adds a bookmark
router.post("/add", authMiddleware, BlogBookmarkController.add);

// User removes a bookmark
router.post("/remove", authMiddleware, BlogBookmarkController.remove);

// User gets ALL their bookmarks
router.get("/list", authMiddleware, BlogBookmarkController.list);

// Check if blog is bookmarked by user
router.get("/status", authMiddleware, BlogBookmarkController.status);

export default router;
