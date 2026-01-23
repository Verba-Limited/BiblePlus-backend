import AppError from "../../core/AppError";
import { QuizQuestion } from "./quizQuestion.model";
import { QuizAttempt } from "./quizAttempt.model";
import { QuizDailyAttempt } from "./quizDailyAttempt";
import { QuizLevelService } from "./quizLevel.service";

export const QuizService = {
  /* =======================================================
     PLAY QUIZ (Normal / Puzzle / Level)
  ======================================================= */
  async play(mode: "normal" | "puzzle" | "daily", level: number) {
    const questions = await QuizQuestion.find({
      mode,
      level,
      active: true
    }).limit(10);

    if (!questions.length) {
      throw new AppError("No questions available for this level", 404);
    }

    return {
      mode,
      level,
      timer: 30,
      total: questions.length,
      questions: questions.map(q => ({
        _id: q._id,
        question: q.question,
        image: q.image,
        options: q.options
      }))
    };
  },

  /* =======================================================
     SUBMIT QUIZ (Grading + XP Update + Level Progress)
  ======================================================= */
  async submit(userId: string, payload: { mode: string; level: number; answers: any[] }) {
    const { mode, level, answers } = payload;

    if (!answers?.length) throw new AppError("No answers submitted", 400);

    let correct = 0;

    for (const a of answers) {
      const q = await QuizQuestion.findById(a.questionId);
      if (q && q.correctAnswer === a.answer) correct++;
    }

    const score = Math.round((correct / answers.length) * 100);

    // Save attempt
    await QuizAttempt.create({
      userId,
      mode,
      level,
      score,
      correct,
      total: answers.length
    });

    // XP logic: 10 XP per correct answer
    const xpGained = correct * 10;
    const progress = await QuizLevelService.addXp(userId, xpGained);

    // Unlock next level if score >= 70%
    const unlockedNextLevel = score >= 70;

    return {
      mode,
      level,
      score,
      correct,
      total: answers.length,
      unlockedNextLevel,
      xpEarned: xpGained,
      levelProgress: progress
    };
  },

  /* =======================================================
     DAILY QUIZ FETCH
  ======================================================= */
  async daily(userId: string) {
    const today = new Date().toISOString().split("T")[0];

    const already = await QuizDailyAttempt.findOne({
      userId,
      date: today
    });

    if (already) {
      throw new AppError("Daily quiz already completed", 400);
    }

    const questions = await QuizQuestion.aggregate([
      { $match: { mode: "daily", active: true } },
      { $sample: { size: 5 } }
    ]);

    return {
      date: today,
      timer: 30,
      total: questions.length,
      questions: questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        image: q.image
      }))
    };
  },

  /* =======================================================
     DAILY QUIZ SUBMIT
  ======================================================= */
  async submitDaily(userId: string, answers: any[]) {
    if (!answers?.length) throw new AppError("Answers required", 400);

    let correct = 0;

    for (const a of answers) {
      const q = await QuizQuestion.findById(a.questionId);
      if (q && q.correctAnswer === a.answer) correct++;
    }

    const score = Math.round((correct / answers.length) * 100);
    const today = new Date().toISOString().split("T")[0];

    await QuizDailyAttempt.create({
      userId,
      date: today,
      answers: {
        score
      }
    });

    // Reward XP for daily completion
    const xpGained = correct * 15; // slightly higher reward
    const progress = await QuizLevelService.addXp(userId, xpGained);

    return {
      message: "Daily quiz completed",
      score,
      correct,
      total: answers.length,
      xpEarned: xpGained,
      levelProgress: progress
    };
  }
};