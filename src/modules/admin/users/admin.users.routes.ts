import { Router } from "express";
import { AdminUsersController } from "./admin.users.controller";

const router = Router();

router.get("/", AdminUsersController.getAllUsers);
router.get("/:id", AdminUsersController.getUserById);

router.put("/:id/reset-password", AdminUsersController.resetUserPassword);

/* ======================================================
   ACTIVATE / DEACTIVATE
   PATCH and PUT both accepted so the portal can use either.
====================================================== */
router.patch("/:id/deactivate", AdminUsersController.deactivateUser);
router.put("/:id/deactivate", AdminUsersController.deactivateUser);

router.patch("/:id/activate", AdminUsersController.activateUser);
router.put("/:id/activate", AdminUsersController.activateUser);

// Toggle, or set an exact state with { "isActive": true|false }
router.patch("/:id/status", AdminUsersController.toggleUserActive);
router.put("/:id/status", AdminUsersController.toggleUserActive);

/* ======================================================
   SOFT DELETE + RESTORE
====================================================== */
router.delete("/:id", AdminUsersController.banUser);
router.patch("/:id/restore", AdminUsersController.restoreUser);
router.put("/:id/restore", AdminUsersController.restoreUser);

export default router;
