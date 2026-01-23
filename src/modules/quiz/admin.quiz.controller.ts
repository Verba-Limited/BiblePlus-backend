// src/modules/quiz/admin.quiz.controller.ts
import { Request, Response, NextFunction } from "express";
import { AdminQuizService } from "./admin.quiz.service";

export const AdminQuizController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await AdminQuizService.create(req.body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await AdminQuizService.update(req.params.id, req.body);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await AdminQuizService.delete(req.params.id);
      res.json({ success: true, message: "Question deleted" });
    } catch (e) {
      next(e);
    }
  },

  toggle: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await AdminQuizService.toggle(req.params.id);
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  },

  bulkCreate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await AdminQuizService.bulkCreate(req.body.questions);
      res.json({ success: true, count: data.length });
    } catch (e) {
      next(e);
    }
  }
};