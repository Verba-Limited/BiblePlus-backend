import { Router } from "express";
import { SystemConfigController } from "./admin.systemConfig.controller";

const router = Router();

router.get("/", SystemConfigController.getAll);
router.get("/:key", SystemConfigController.getByKey);
router.put("/:key", SystemConfigController.update);
router.post("/", SystemConfigController.create);

export default router;
