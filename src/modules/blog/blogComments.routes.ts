import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { BlogCommentController } from "./blogComment.controller";

const router = Router();

// PUBLIC — fetch comments for a blog
router.get("/:blogId", BlogCommentController.getComments);

// USER — create comment
router.post("/", authMiddleware, BlogCommentController.create);

// USER — update own comment
router.put("/:id", authMiddleware, BlogCommentController.update);

// USER — delete own comment
router.delete("/:id", authMiddleware, BlogCommentController.deleteOwn);

// ADMIN — delete any comment
router.delete("/:id/admin", authMiddleware, adminOnly, BlogCommentController.adminDelete);

export default router;
