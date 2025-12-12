import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { BlogLikeController } from "./blogLike.controller";

const router = Router();

/* ======================================================
   📌 USER LIKE ACTIONS (Auth Required)
====================================================== */

// Like a blog
router.post("/like", authMiddleware, BlogLikeController.like);

// Unlike a blog
router.post("/unlike", authMiddleware, BlogLikeController.unlike);

// Check if user liked a blog
router.get("/status/:blogId", authMiddleware, BlogLikeController.status);


/* ======================================================
   📌 PUBLIC — LIKE COUNT (No Auth)
====================================================== */
router.get("/count/:blogId", BlogLikeController.count);

export default router;
