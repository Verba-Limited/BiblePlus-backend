import { Router } from "express";
import { EventController } from "./event.controller";
import { EventReminderController } from "./eventReminder.controller";
import { SpeakerController } from "./speaker.controller";
import authMiddleware from "../../middleware/auth.middleware";


const router = Router();

/* ======================================================
    📌 PUBLIC EVENT ROUTES  (NO AUTH)
====================================================== */
router.get("/", EventController.getEvents);
router.get("/upcoming", EventController.upcoming);
router.get("/past", EventController.past);
router.get("/search", EventController.search);

/* MUST COME BEFORE /:id TO AVOID ROUTE COLLISION */
router.get("/speakers", SpeakerController.getAll);
router.get("/speakers/:id", SpeakerController.getOne);

/* This MUST stay last among public routes */
router.get("/:id", EventController.getEvent);

export default router;
