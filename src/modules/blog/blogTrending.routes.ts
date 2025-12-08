import { Router } from "express";
import { BlogTrendingController } from "./blogTrending.controller";

const router = Router();

router.get("/", BlogTrendingController.getTrending);

export default router;
