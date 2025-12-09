import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { BlogController } from "./blog.controller";
import multer from "multer";

const upload = multer({ dest: "uploads/blog" });

const router = Router();

// PUBLIC ROUTES
router.get("/", BlogController.getAll);
router.get("/search", BlogController.search);
router.get("/:slug", BlogController.getOne);

// ADMIN ROUTES
router.post(
  "/",
  authMiddleware,
  adminOnly,
  upload.single("coverImage"),
  BlogController.create
);

router.put(
  "/:id",
  authMiddleware,
  adminOnly,
  BlogController.update
);

router.put(
  "/:id/publish",
  authMiddleware,
  adminOnly,
  BlogController.publish
);

router.delete(
  "/:id",
  authMiddleware,
  adminOnly,
  BlogController.delete
);

export default router;
