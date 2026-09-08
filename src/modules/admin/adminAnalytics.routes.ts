import { Router } from "express";
import { AdminAnalyticsController } from "./adminAnalytics.controller";

const router = Router();

// Merged Overview + Analytics payload — one request for the whole page
router.get("/dashboard", AdminAnalyticsController.dashboard);

router.get("/overview", AdminAnalyticsController.overview);
router.get("/activity", AdminAnalyticsController.activity);
router.get("/trending", AdminAnalyticsController.trending);
router.get("/system", AdminAnalyticsController.systemHealth);

export default router;
