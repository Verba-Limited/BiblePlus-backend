import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { BookFavoriteController } from "./bookFavorite.controller";

const router = Router();

router.post("/add", authMiddleware, BookFavoriteController.add);
router.post("/remove", authMiddleware, BookFavoriteController.remove);
router.get("/", authMiddleware, BookFavoriteController.all);

export default router;
