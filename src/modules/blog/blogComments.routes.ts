import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { BlogCommentController } from "./blogComment.controller";

const router = Router();

/* ======================================================
   📌 PUBLIC — FETCH COMMENTS FOR A BLOG
====================================================== */
router.get("/blog/:blogId", BlogCommentController.getComments);

/* ======================================================
   📌 USER COMMENT ACTIONS
====================================================== */
router.post("/", authMiddleware, BlogCommentController.create);

router.put("/:id", authMiddleware, BlogCommentController.update);

router.delete("/:id", authMiddleware, BlogCommentController.deleteOwn);

/* ======================================================
   📌 ADMIN COMMENT MANAGEMENT
====================================================== */

// Admin delete ANY comment
router.delete("/admin/:id", authMiddleware, adminOnly, BlogCommentController.adminDelete);

export default router;
