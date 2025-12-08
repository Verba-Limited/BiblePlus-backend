import { Router } from "express";
import authMiddleware from "../../../middleware/auth.middleware";
import { EventAttendanceController } from "./eventAttendance.controller";

const router = Router();

// User attends event
router.post("/attend", authMiddleware, EventAttendanceController.attend);

// User cancels attendance
router.post("/unattend", authMiddleware, EventAttendanceController.unattend);

// Get all attendees for event
router.get("/attendees/:id", EventAttendanceController.attendees);

// Get attendees count
router.get("/count/:id", EventAttendanceController.count);

// Get whether user is attending
router.get("/status", authMiddleware, EventAttendanceController.userStatus);

export default router;
