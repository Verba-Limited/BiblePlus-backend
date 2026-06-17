import { Router } from "express";
import { BlogController } from "./blog.controller";
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
   SLUG + ID ROUTES
   ✅ Must come LAST — these catch-all /:param routes
   will swallow /search, /admin etc if placed above
====================================================== */
router.get("/id/:id", BlogController.getOneById); // GET by ID
router.get("/:slug", BlogController.getOne);      // GET by slug

export default router;