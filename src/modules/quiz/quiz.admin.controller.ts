import { NextFunction, Request, Response } from "express";
import { QuizAdminService } from "./quiz.admin.service";

export const QuizAdminController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        data: await QuizAdminService.createQuestion(req.body)
      });
    } catch (e) {
      next(e);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        data: await QuizAdminService.updateQuestion(
          req.params.id,
          req.body
        )
      });
    } catch (e) {
      next(e);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await QuizAdminService.deleteQuestion(req.params.id);
      res.json({ success: true });
    } catch (e) {
      next(e);
    }
  },

  all: async (_: Request, res: Response, next: NextFunction) => {
    try {
      res.json({
        success: true,
        data: await QuizAdminService.getAll()
      });
    } catch (e) {
      next(e);
    }
  }
};