import { Router } from "express";
import { AdminManagementController } from "./admin.management.controller";

const router = Router();

router.post("/", AdminManagementController.createAdmin);
router.get("/", AdminManagementController.listAdmins);
router.delete("/:id", AdminManagementController.deleteAdmin);

export default router;
