import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { BlogCommentController } from "./blogComment.controller";

const router = Router();

router.get("/:blogId", BlogCommentController.list);
router.post("/", authMiddleware, BlogCommentController.add);
router.delete("/:id", authMiddleware, BlogCommentController.delete);

export default router;
