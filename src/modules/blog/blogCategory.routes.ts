import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { BlogCategoryController } from "./blogCategory.controller";

const router = Router();

// PUBLIC ROUTE
router.get("/", BlogCategoryController.list);

// ADMIN ROUTES
router.post("/", authMiddleware, adminOnly, BlogCategoryController.create);

router.put("/:id", authMiddleware, adminOnly, BlogCategoryController.update);

router.delete("/:id", authMiddleware, adminOnly, BlogCategoryController.delete);

export default router;
