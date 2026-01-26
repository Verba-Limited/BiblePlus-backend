// src/modules/quiz/admin.quiz.controller.ts
import { Request, Response, NextFunction } from "express";
import { AdminQuizService } from "./admin.quiz.service";

export const AdminQuizController = {
  /* ============================
      CREATE QUESTION
  ============================ */
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const question = await AdminQuizService.create(req.body);

      res.status(201).json({
        success: true,
        message: "Quiz question created successfully",
        data: question
      });
    } catch (err) {
      next(err);
    }
  },

  /* ============================
      UPDATE QUESTION
  ============================ */
  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const updated = await AdminQuizService.update(id, req.body);

      res.json({
        success: true,
        message: "Quiz question updated successfully",
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  /* ============================
      DELETE QUESTION
  ============================ */
  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      await AdminQuizService.delete(id);

      res.json({
        success: true,
        message: "Quiz question deleted successfully"
      });
    } catch (err) {
      next(err);
    }
  },

  /* ============================
      TOGGLE ACTIVE
  ============================ */
  toggle: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;

      const question = await AdminQuizService.toggle(id);

      res.json({
        success: true,
        message: `Question ${
          question.active ? "activated" : "deactivated"
        }`,
        data: question
      });
    } catch (err) {
      next(err);
    }
  },

  /* ============================
      BULK CREATE
  ============================ */
  bulkCreate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { questions } = req.body;

      const inserted = await AdminQuizService.bulkCreate(questions);

      res.status(201).json({
        success: true,
        message: `${inserted.length} questions added`,
        data: inserted
      });
    } catch (err) {
      next(err);
    }
  }
};