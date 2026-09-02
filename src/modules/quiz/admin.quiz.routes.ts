import { Router } from "express";
import { QuizAdminController } from "./quizAdmin.controller";
import { QuizDailyController } from "./quizDaily.controller";

const router = Router();

/* ======================================================
   ADMIN DAILY QUIZ ROUTES
   ✅ Registered before /:id so "daily" isn't swallowed
====================================================== */
router.post("/daily/set", QuizDailyController.adminSetForDate);
router.post("/daily/pool/add", QuizDailyController.adminAddToPool);
router.get("/daily/pool/info", QuizDailyController.getPoolInfo);

/* ======================================================
   ADMIN QUIZ QUESTION ROUTES
====================================================== */
// Levels + difficulties for the editor's dropdowns
router.get("/meta", QuizAdminController.meta);

// The question list the portal needs to render (and delete from)
router.get("/", QuizAdminController.list);

router.post("/add", QuizAdminController.add);
router.post("/", QuizAdminController.add);          // conventional alias
router.post("/bulk", QuizAdminController.bulkAdd);

router.put("/deactivate/:id", QuizAdminController.deactivate);
router.put("/activate/:id", QuizAdminController.activate);

// Bulk delete — must precede /:id
router.delete("/bulk", QuizAdminController.removeMany);

router.put("/:id", QuizAdminController.update);
router.delete("/:id", QuizAdminController.remove);

/* This MUST stay last — it matches anything left over */
router.get("/:id", QuizAdminController.getOne);

export default router;
