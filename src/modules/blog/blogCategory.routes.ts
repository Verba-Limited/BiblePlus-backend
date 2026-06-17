import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { adminOnly } from "../../middleware/admin.middleware";
import { BlogCategoryController } from "./blogCategory.controller";

const router = Router();

// PUBLIC ROUTE
router.get("/", BlogCategoryController.list);

export default router;
