import { Router } from "express";
import { BlogController } from "./blog.controller";
import { adminOnly } from "../../middleware/admin.middleware";
import authMiddleware from "../../middleware/auth.middleware";
import { uploadBlogCover } from "../../middleware/upload.middleware";

const router = Router();

/* ======================================================
   PUBLIC ROUTES
   ✅ Specific routes BEFORE /:slug to avoid collisions
====================================================== */
router.get("/", BlogController.getAll);
router.get("/search", BlogController.search);

/* ======================================================
   ADMIN ROUTES
   ✅ Admin routes before /:slug too
====================================================== */
router.post(
  "/admin",
  authMiddleware,
  adminOnly,
  uploadBlogCover,
  BlogController.create
);

router.put(
  "/admin/:id",
  authMiddleware,
  adminOnly,
  uploadBlogCover,
  BlogController.update
);

router.put(
  "/admin/:id/publish",
  authMiddleware,
  adminOnly,
  BlogController.publish
);

router.delete(
  "/admin/:id",
  authMiddleware,
  adminOnly,
  BlogController.delete
);

// ✅ Manual refresh endpoint for admin
router.post(
  "/admin/refresh",
  authMiddleware,
  adminOnly,
  BlogController.refreshExternal
);

/* ======================================================
   SLUG + ID ROUTES
   ✅ Must come LAST — these catch-all /:param routes
   will swallow /search, /admin etc if placed above
====================================================== */
router.get("/id/:id", BlogController.getOneById); // GET by ID
router.get("/:slug", BlogController.getOne);      // GET by slug

export default router;