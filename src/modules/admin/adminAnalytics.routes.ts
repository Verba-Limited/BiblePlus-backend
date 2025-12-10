import { Router } from "express";
import { adminOnly } from "../../middleware/admin.middleware";
import authMiddleware from "../../middleware/auth.middleware";
import { AdminAnalyticsController } from "./adminAnalytics.controller";

const router = Router();

router.get("/overview", authMiddleware, adminOnly, AdminAnalyticsController.overview);
router.get("/activity", authMiddleware, adminOnly, AdminAnalyticsController.activity);
router.get("/trending", authMiddleware, adminOnly, AdminAnalyticsController.trending);
router.get("/system", authMiddleware, adminOnly, AdminAnalyticsController.systemHealth);

export default router;
