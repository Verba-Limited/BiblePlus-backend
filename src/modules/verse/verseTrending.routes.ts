import { Router } from "express";
import { VerseTrendingController } from "./verseTrending.controller";

const router = Router();

router.get(
  "/trending",
  VerseTrendingController.trending
);

export default router;