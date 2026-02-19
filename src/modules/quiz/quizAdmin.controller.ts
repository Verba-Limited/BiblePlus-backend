import { Request, Response, NextFunction } from "express";
import { QuizAdminService } from "./quizAdmin.service";

export const QuizAdminController = {

  add: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizAdminService.addQuestion(req.body);

      res.status(201).json({
        success: true,
        message: "Question added successfully",
        data
      });

    } catch (err) {
      next(err);
    }
  },

  bulkAdd: async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await QuizAdminService.addBulk(req.body);

    res.status(201).json({
      success: true,
      message: "Questions added successfully",
      data
    });
  } catch (err) {
    next(err);
  }
},

  deactivate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizAdminService.deactivateQuestion(req.params.id);

      res.json({
        success: true,
        message: "Question deactivated",
        data
      });

    } catch (err) {
      next(err);
    }
  }

};