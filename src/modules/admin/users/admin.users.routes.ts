import { Router } from "express";
import { AdminUsersController } from "./admin.users.controller";

const router = Router();

router.get("/", AdminUsersController.getAllUsers);
router.get("/:id", AdminUsersController.getUserById);
router.put("/:id/reset-password", AdminUsersController.resetUserPassword);
router.delete("/:id", AdminUsersController.banUser);

export default router;
