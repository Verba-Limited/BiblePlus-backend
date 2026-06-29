import { Router } from "express";
import { BlogController } from "./blog.controller";
import { BlogCommentController } from "./blogComment.controller";
import { uploadBlogCover } from "../../middleware/upload.middleware";

const router = Router();

/* ======================================================
   ADMIN BLOG ROUTES
====================================================== */
router.post(
  "/",
  uploadBlogCover,
  BlogController.create
);

router.post(
  "/upload-image",
  uploadBlogCover,
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }
    res.json({
      success: true,
      url: req.file.path
    });
  }
);

router.put(
  "/:id",
  uploadBlogCover,
  BlogController.update
);

router.put(
  "/:id/publish",
  BlogController.publish
);

router.delete(
  "/:id",
  BlogController.delete
);

router.post(
  "/refresh",
  BlogController.refreshExternal
);

/* ======================================================
   ADMIN COMMENT ROUTES
====================================================== */
router.delete("/comments/:id", BlogCommentController.adminDelete);

export default router;
