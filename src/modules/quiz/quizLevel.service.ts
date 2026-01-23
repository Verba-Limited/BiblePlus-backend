import { QuizProgress } from "./quizProgress.model";

const LEVEL_XP: Record<number, number> = {
  1: 0,
  2: 100,
  3: 250,
  4: 450,
  5: 700,
  6: 1000,
  7: 1350,
  8: 1750,
  9: 2200,
  10: 2700
};

export const QuizLevelService = {
  addXp: async (userId: string, earnedXp: number) => {
    let progress = await QuizProgress.findOne({ userId });

    if (!progress) {
      progress = await QuizProgress.create({ userId });
    }

    progress.xp += earnedXp;

    // Determine new level
    let newLevel = progress.level;
    for (let lvl = 10; lvl >= 1; lvl--) {
      if (progress.xp >= LEVEL_XP[lvl]) {
        newLevel = lvl;
        break;
      }
    }

    progress.level = newLevel;
    await progress.save();

    return progress;
  }
};