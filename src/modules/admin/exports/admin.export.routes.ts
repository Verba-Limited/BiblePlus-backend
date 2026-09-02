import { Router } from "express";
import { ExportController } from "./admin.export.controller";

const router = Router();

/* ======================================================
   DATA EXPORTS
   Mounted behind requireRole("superadmin") in
   admin.index.routes.ts — downloads stay admin-only.
====================================================== */

// Preview the rows before downloading them
router.get("/preview", ExportController.preview);

// ?format=csv (default) | excel
router.get("/users", ExportController.exportUsers);
router.get("/prayers", ExportController.exportPrayers);

export default router;
