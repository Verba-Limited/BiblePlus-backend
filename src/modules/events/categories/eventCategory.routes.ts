import { Router } from "express";
import authMiddleware from "../../../middleware/auth.middleware";
import { EventCategoryController } from "./eventCategory.controller";

const router = Router();

// Admin
router.post("/", authMiddleware, EventCategoryController.create);
router.put("/:id", authMiddleware, EventCategoryController.update);
router.delete("/:id", authMiddleware, EventCategoryController.delete);

// Public
router.get("/", EventCategoryController.list);

export default router;
