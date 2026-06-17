import { Router } from "express";
import { ExportController } from "./admin.export.controller";

const router = Router();

router.get("/users", ExportController.exportUsers);
router.get("/prayers", ExportController.exportPrayers);

export default router;
