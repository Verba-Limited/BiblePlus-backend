import { Router } from "express";
import { BlogCategoryController } from "./blogCategory.controller";

const router = Router();

router.post("/", BlogCategoryController.create);
router.put("/:id", BlogCategoryController.update);
router.delete("/:id", BlogCategoryController.delete);

export default router;
