import { Router } from "express";
import { BlogTrendingController } from "./blogTrending.controller";

const router = Router();

// GET /api/blog-trending?limit=20
router.get("/", BlogTrendingController.getTrending);

// GET /api/blog-trending/category/faith?limit=20
router.get("/category/:category", BlogTrendingController.getTrendingByCategory);

export default router;
