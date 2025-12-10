import { Router } from "express";
import { BlogTrendingController } from "./blogTrending.controller";

const router = Router();

// PUBLIC — get trending blogs
router.get("/", BlogTrendingController.getTrending);

// PUBLIC — get trending in specific category
router.get("/category/:category", BlogTrendingController.getTrendingByCategory);

export default router;
