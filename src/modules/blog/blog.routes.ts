import { Router } from "express";
import { BlogController } from "./blog.controller";
import { adminOnly } from "../../middleware/admin.middleware";
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
  adminOnly,
  uploadBlogCover,
  BlogController.create
);

router.put(
  "/admin/:id",
  adminOnly,
  uploadBlogCover,
  BlogController.update
);

router.put(
  "/admin/:id/publish",
  adminOnly,
  BlogController.publish
);

router.delete(
  "/admin/:id",
  adminOnly,
  BlogController.delete
);

// ✅ Manual refresh endpoint for admin
router.post(
  "/admin/refresh",
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