import { Router } from "express";
import { BlogController } from "./blog.controller";
import { adminOnly } from "../../middleware/admin.middleware";
import multer from "multer";

const upload = multer({ dest: "uploads/blog" });

const router = Router();


router.get("/:id", BlogController.getOneById); //
/* ======================================================
   📌 PUBLIC BLOG ROUTES
====================================================== */
router.get("/", BlogController.getAll);         // List blogs
router.get("/search", BlogController.search);   // Search blogs

// MUST COME LAST among public routes to avoid collisions
router.get("/:slug", BlogController.getOne);    // Get by slug


/* ======================================================
   📌 ADMIN BLOG ROUTES
   (NO authMiddleware — adminOnly is enough)
====================================================== */

// Create blog
router.post(
  "/admin",
  adminOnly,
  upload.single("coverImage"),
  BlogController.create
);

// Update blog
router.put(
  "/admin/:id",
  adminOnly,
  BlogController.update
);

// Publish blog
router.put(
  "/admin/:id/publish",
  adminOnly,
  BlogController.publish
);

// Delete blog
router.delete(
  "/admin/:id",
  adminOnly,
  BlogController.delete
);

export default router;
