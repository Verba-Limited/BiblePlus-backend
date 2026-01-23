// src/modules/quiz/quiz.service.ts
import AppError from "../../core/AppError";
import { QuizQuestion } from "./quizQuestion.model";
import { QuizAttempt } from "./quizAttempt.model";
import { QuizDailyAttempt } from "./quizDailyAttempt";
import { QuizLevelService } from "./quizLevel.service";

type QuizMode = "general" | "puzzle" | "daily";

export const QuizService = {
  /* =======================================================
     PLAY QUIZ (GENERAL / PUZZLE / LEVEL)
  ======================================================= */
  async play(mode: QuizMode, level: number) {
    if (!mode) throw new AppError("Quiz mode is required", 400);
    if (level < 1 || level > 10) {
      throw new AppError("Invalid quiz level", 400);
    }

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
        options: q.options,
        image: q.image ?? null
      }))
    };
  },

  /* =======================================================
     SUBMIT QUIZ (GRADE + XP + LEVEL PROGRESS)
  ======================================================= */
  async submit(
    userId: string,
    payload: { mode: QuizMode; level: number; answers: any[] }
  ) {
    const { mode, level, answers } = payload;

    if (!answers || !answers.length) {
      throw new AppError("No answers submitted", 400);
    }

    const questions = await QuizQuestion.find({
      _id: { $in: answers.map(a => a.questionId) }
    });

    let correct = 0;

    for (const answer of answers) {
      const q = questions.find(
        q => q._id.toString() === answer.questionId
      );
      if (q && q.correctAnswer === answer.answer) correct++;
    }

    const total = answers.length;
    const score = Math.round((correct / total) * 100);

    await QuizAttempt.create({
      userId,
      mode,
      level,
      score,
      correct,
      total
    });

    // XP logic
    const xpEarned = correct * 10;
    const levelProgress = await QuizLevelService.addXp(
      userId,
      xpEarned
    );

    return {
      mode,
      level,
      score,
      correct,
      total,
      unlockedNextLevel: score >= 70,
      xpEarned,
      levelProgress
    };
  },

  /* =======================================================
     DAILY QUIZ FETCH
  ======================================================= */
  async daily(userId: string) {
    const today = new Date().toISOString().split("T")[0];

    const alreadyDone = await QuizDailyAttempt.findOne({
      userId,
      date: today
    });

    if (alreadyDone) {
      throw new AppError("Daily quiz already completed", 400);
    }

    const questions = await QuizQuestion.aggregate([
      { $match: { mode: "daily", active: true } },
      { $sample: { size: 5 } }
    ]);

    if (!questions.length) {
      throw new AppError("No daily quiz questions available", 404);
    }

    return {
      date: today,
      timer: 30,
      total: questions.length,
      questions: questions.map(q => ({
        _id: q._id,
        question: q.question,
        options: q.options,
        image: q.image ?? null
      }))
    };
  },

  /* =======================================================
     DAILY QUIZ SUBMIT
  ======================================================= */
  async submitDaily(userId: string, answers: any[]) {
    if (!answers || !answers.length) {
      throw new AppError("Answers are required", 400);
    }

    const today = new Date().toISOString().split("T")[0];

    const existing = await QuizDailyAttempt.findOne({
      userId,
      date: today
    });

    if (existing) {
      throw new AppError("Daily quiz already submitted", 400);
    }

    const questions = await QuizQuestion.find({
      _id: { $in: answers.map(a => a.questionId) }
    });

    let correct = 0;

    for (const answer of answers) {
      const q = questions.find(
        q => q._id.toString() === answer.questionId
      );
      if (q && q.correctAnswer === answer.answer) correct++;
    }

    const total = answers.length;
    const score = Math.round((correct / total) * 100);

    await QuizDailyAttempt.create({
      userId,
      date: today,
      answers: {
        score
      }
    });

    const xpEarned = correct * 15;
    const levelProgress = await QuizLevelService.addXp(
      userId,
      xpEarned
    );

    return {
      message: "Daily quiz completed",
      score,
      correct,
      total,
      xpEarned,
      levelProgress
    };
  }
};