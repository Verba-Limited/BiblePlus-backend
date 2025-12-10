import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { BlogLikeController } from "./blogLike.controller";

const router = Router();

/* ================================
   USER LIKE SYSTEM
================================ */

// Like a blog
router.post("/like", authMiddleware, BlogLikeController.like);

// Unlike a blog
router.post("/unlike", authMiddleware, BlogLikeController.unlike);

// Get like status for user
router.get("/status", authMiddleware, BlogLikeController.status);

// Get like count for the blog (public)
router.get("/count/:blogId", BlogLikeController.count);

export default router;
