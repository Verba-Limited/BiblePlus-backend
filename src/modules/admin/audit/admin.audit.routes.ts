import { Router } from "express";
import { AuditLogController } from "./admin.audit.controller";

const router = Router();

router.get("/", AuditLogController.getAll);

export default router;
