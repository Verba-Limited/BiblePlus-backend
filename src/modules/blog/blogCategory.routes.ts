import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { BlogCategoryController } from "./blogCategory.controller";

const router = Router();

router.get("/", BlogCategoryController.list);
router.post("/", authMiddleware, BlogCategoryController.create);
router.put("/:id", authMiddleware, BlogCategoryController.update);
router.delete("/:id", authMiddleware, BlogCategoryController.delete);

export default router;
