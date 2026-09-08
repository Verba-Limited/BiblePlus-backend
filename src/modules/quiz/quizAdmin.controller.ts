import { Request, Response, NextFunction } from "express";
import { QuizAdminService } from "./quizAdmin.service";
import { readSearchTerm } from "../../utils/sanitize";

export const QuizAdminController = {

  /* -----------------------------------------------------
     LIST QUESTIONS
  ----------------------------------------------------- */
  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await QuizAdminService.listQuestions({
        level: req.query.level,
        difficulty: req.query.difficulty,
        source: req.query.source,
        active: req.query.active,
        page: req.query.page,
        limit: req.query.limit,
        search: readSearchTerm(req.query as any)
      });

      res.json({
        success: true,
        count: result.questions.length,
        total: result.pagination.total,
        counts: result.counts,
        pagination: result.pagination,
        data: result.questions
      });
    } catch (err) {
      next(err);
    }
  },

  /* -----------------------------------------------------
     METADATA — levels + difficulties for the editor
  ----------------------------------------------------- */
  meta: async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizAdminService.getMeta();
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  getOne: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizAdminService.getQuestion(req.params.id);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

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
      const result = await QuizAdminService.addBulk(req.body);

      res.status(201).json({
        success: true,
        message: result.skipped
          ? `${result.inserted} question(s) added, ${result.skipped} skipped`
          : `${result.inserted} question(s) added successfully`,
        inserted: result.inserted,
        skipped: result.skipped,
        errors: result.errors,
        data: result.questions
      });
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizAdminService.updateQuestion(req.params.id, req.body);

      res.json({
        success: true,
        message: "Question updated successfully",
        data
      });
    } catch (err) {
      next(err);
    }
  },

  deactivate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizAdminService.deactivateQuestion(req.params.id);
      res.json({ success: true, message: "Question deactivated", data });
    } catch (err) {
      next(err);
    }
  },

  activate: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizAdminService.activateQuestion(req.params.id);
      res.json({ success: true, message: "Question reactivated", data });
    } catch (err) {
      next(err);
    }
  },

  /* -----------------------------------------------------
     DELETE — the portal had no endpoint for this at all,
     which is why it had no button.
  ----------------------------------------------------- */
  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await QuizAdminService.deleteQuestion(req.params.id);
      res.json({ success: true, message: "Question deleted", data });
    } catch (err) {
      next(err);
    }
  },

  removeMany: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const result = await QuizAdminService.deleteMany(req.body?.ids);
      res.json({
        success: true,
        message: `${result.deleted} question(s) deleted`,
        ...result
      });
    } catch (err) {
      next(err);
    }
  }
};
