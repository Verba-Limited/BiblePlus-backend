import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { QuizPuzzleController } from "./quizPuzzle.controller";

const router = Router();

/*
|--------------------------------------------------------------------------
| PUZZLE ROUTES
| Mounted at: /api/quiz/puzzle
|--------------------------------------------------------------------------
| Public read access (no auth required)
| Auth can be added later for attempt tracking
|--------------------------------------------------------------------------
*/

// Puzzle by level
router.get("/level/:level", QuizPuzzleController.getByLevel);

// Today’s puzzle
router.get("/today", QuizPuzzleController.getToday);

// Puzzle history
router.get("/history", QuizPuzzleController.getHistory);

// Puzzle by date (must be last to avoid collision)
router.get("/:date", QuizPuzzleController.getByDate);

export default router;