import { Router } from "express";
import { EventCategoryController } from "./eventCategory.controller";

const router = Router();

// Admin
router.post("/", EventCategoryController.create);
router.put("/:id", EventCategoryController.update);
router.delete("/:id", EventCategoryController.delete);

export default router;
