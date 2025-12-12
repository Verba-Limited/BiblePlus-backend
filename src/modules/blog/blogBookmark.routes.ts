import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { BlogBookmarkController } from "./blogBookmark.controller";

const router = Router();

/* ================================
      USER BOOKMARK ROUTES
================================ */

// Add bookmark
router.post("/", authMiddleware, BlogBookmarkController.add);

// Remove bookmark (REST version)
router.delete("/:blogId", authMiddleware, BlogBookmarkController.remove);

// List all bookmarks
router.get("/", authMiddleware, BlogBookmarkController.list);

// Check bookmark status
router.get("/status/:blogId", authMiddleware, BlogBookmarkController.status);

export default router;
