import { Router } from "express";
import { QuizAdminController } from "./quizAdmin.controller";
import { QuizDailyController } from "./quizDaily.controller";

const router = Router();

/* ======================================================
   ADMIN QUIZ ROUTES
====================================================== */
router.post("/add", QuizAdminController.add);
router.post("/bulk", QuizAdminController.bulkAdd);
router.put("/deactivate/:id", QuizAdminController.deactivate);

/* ======================================================
   ADMIN DAILY QUIZ ROUTES
====================================================== */
router.post("/daily/set", QuizDailyController.adminSetForDate);
router.post("/daily/pool/add", QuizDailyController.adminAddToPool);
router.get("/daily/pool/info", QuizDailyController.getPoolInfo);

export default router;
