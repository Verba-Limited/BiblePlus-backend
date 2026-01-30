// src/modules/quiz/admin.quiz.controller.ts
import { Request, Response, NextFunction } from "express";
import { AdminQuizService } from "./admin.quiz.service";

export const AdminQuizController = {
  /* =====================================================
     CREATE QUESTION
     POST /api/quiz/admin/questions
  ===================================================== */
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const question = await AdminQuizService.create(req.body);

      return res.status(201).json({
        success: true,
        message: "Quiz question created successfully",
        data: question
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     BULK CREATE QUESTIONS
     POST /api/quiz/admin/questions/bulk
  ===================================================== */
  async bulkCreate(req: Request, res: Response, next: NextFunction) {
    try {
      const { questions } = req.body;

      if (!Array.isArray(questions)) {
        return res.status(400).json({
          success: false,
          message: "questions must be an array"
        });
      }

      const inserted = await AdminQuizService.bulkCreate(questions);

      return res.status(201).json({
        success: true,
        message: `${inserted.length} questions added`,
        data: inserted
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     UPDATE QUESTION
     PUT /api/quiz/admin/questions/:id
  ===================================================== */
  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const updated = await AdminQuizService.update(id, req.body);

      return res.json({
        success: true,
        message: "Quiz question updated successfully",
        data: updated
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     TOGGLE QUESTION ACTIVE / INACTIVE
     PATCH /api/quiz/admin/questions/:id/toggle
  ===================================================== */
  async toggle(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      const question = await AdminQuizService.toggle(id);

      return res.json({
        success: true,
        message: question.active
          ? "Question activated"
          : "Question deactivated",
        data: question
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
     DELETE QUESTION
     DELETE /api/quiz/admin/questions/:id
  ===================================================== */
  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;

      await AdminQuizService.delete(id);

      return res.json({
        success: true,
        message: "Quiz question deleted successfully"
      });
    } catch (err) {
      next(err);
    }
  }
};