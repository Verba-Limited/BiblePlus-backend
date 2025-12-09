import { Router } from "express";
import { AdminController } from "./admin.controller";

const router = Router();

router.post("/login", AdminController.login);

export default router;
