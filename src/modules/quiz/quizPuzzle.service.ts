import AppError from "../../core/AppError";
import { QuizPuzzle } from "./quizPuzzle.model";

export const QuizPuzzleService = {
  getByLevel: async (level: number) => {
    const puzzles = await QuizPuzzle.find({ level });

    if (!puzzles.length) {
      throw new AppError("No puzzles available for this level", 404);
    }

    return puzzles;
  }
};