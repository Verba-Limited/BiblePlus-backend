// src/modules/quiz/quizPuzzle.service.ts
import AppError from "../../core/AppError";
import { QuizPuzzle } from "./quizPuzzle.model";

const todayKey = () => new Date().toISOString().split("T")[0];

export const QuizPuzzleService = {
  /* =====================================================
     GET PUZZLES BY LEVEL (Puzzle Mode)
     Used for level-based puzzle play
  ===================================================== */
  async getByLevel(level: number) {
    if (!level || level < 1) {
      throw new AppError("Valid puzzle level is required", 400);
    }

    const puzzles = await QuizPuzzle.find({
      level,
      active: true
    }).sort({ createdAt: 1 });

    if (!puzzles.length) {
      throw new AppError(
        `No puzzles available for level ${level}`,
        404
      );
    }

    return {
      level,
      total: puzzles.length,
      puzzles
    };
  },

  /* =====================================================
     GET TODAY'S PUZZLE
     (Daily-style puzzle)
  ===================================================== */
  async getToday() {
    const date = todayKey();

    const puzzle = await QuizPuzzle.findOne({
      date,
      active: true
    });

    if (!puzzle) {
      throw new AppError("Today's puzzle is not available", 404);
    }

    return puzzle;
  },

  /* =====================================================
     GET PAST PUZZLE BY DATE (YYYY-MM-DD)
     Read-only use
  ===================================================== */
  async getByDate(date: string) {
    if (!date) {
      throw new AppError("Puzzle date is required", 400);
    }

    const puzzle = await QuizPuzzle.findOne({
      date,
      active: true
    });

    if (!puzzle) {
      throw new AppError(
        `No puzzle found for date ${date}`,
        404
      );
    }

    return puzzle;
  },

  /* =====================================================
     GET PUZZLE HISTORY (Paginated)
  ===================================================== */
  async getHistory(limit = 7) {
    return await QuizPuzzle.find({ active: true })
      .sort({ date: -1 })
      .limit(limit)
      .select("-__v");
  }
};