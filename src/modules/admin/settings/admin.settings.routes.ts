import { Router } from "express";
import { AdminSettingsController } from "./admin.settings.controller";

const router = Router();

router.post("/password/request-otp", AdminSettingsController.requestPasswordOtp);
router.put("/password", AdminSettingsController.changePassword);

export default router;
