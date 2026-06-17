import { Router } from "express";
import authMiddleware from "../../../middleware/auth.middleware";
import { EventCategoryController } from "./eventCategory.controller";

const router = Router();



// Public
router.get("/", EventCategoryController.list);

export default router;
