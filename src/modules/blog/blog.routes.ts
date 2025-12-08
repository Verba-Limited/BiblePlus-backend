import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { BlogController } from "./blog.controller";
import multer from "multer";

const upload = multer({ dest: "uploads/blog" });

const router = Router();

router.get("/", BlogController.getAll);
router.get("/search", BlogController.search);
router.get("/:slug", BlogController.getOne);

// Admin routes
router.post("/", authMiddleware, upload.single("coverImage"), BlogController.create);
router.put("/:id", authMiddleware, BlogController.update);
router.put("/:id/publish", authMiddleware, BlogController.publish);
router.delete("/:id", authMiddleware, BlogController.delete);

export default router;
