import { Router } from "express";
import { AuditLogController } from "./admin.audit.controller";

const router = Router();

/* Specific paths before the list */
router.get("/filters", AuditLogController.getFilters);

// Export the activity log as CSV or Excel (?format=csv|excel)
router.get("/export", AuditLogController.exportLogs);

router.get("/", AuditLogController.getAll);

export default router;
