import { Request, Response, NextFunction } from "express";
import { VerseEngagementService } from "./verseEngagement.service";
import AppError from "../../core/AppError";

export const VerseEngagementController = {

  like: async (req: Request, res: Response, next: NextFunction) => {
    try {

      if (!req.userId) throw new AppError("Unauthorized", 401);

      const data = await VerseEngagementService.like(
        req.userId,
        req.params.id
      );

      res.json({ success: true, data });

    } catch (err) {
      next(err);
    }
  },

  comment: async (req: Request, res: Response, next: NextFunction) => {
    try {

      if (!req.userId) throw new AppError("Unauthorized", 401);

      const data = await VerseEngagementService.comment(
        req.userId,
        req.params.id,
        req.body.comment
      );

      res.json({ success: true, data });

    } catch (err) {
      next(err);
    }
  },

  comments: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const data = await VerseEngagementService.getComments(
        req.params.id
      );

      res.json({ success: true, data });

    } catch (err) {
      next(err);
    }
  },

  share: async (req: Request, res: Response, next: NextFunction) => {
    try {

      if (!req.userId) throw new AppError("Unauthorized", 401);

      const data = await VerseEngagementService.share(
        req.userId,
        req.params.id
      );

      res.json({ success: true, data });

    } catch (err) {
      next(err);
    }
  },

  stats: async (req: Request, res: Response, next: NextFunction) => {
    try {

      const data = await VerseEngagementService.stats(
        req.params.id
      );

      res.json({ success: true, data });

    } catch (err) {
      next(err);
    }
  },

  history: async (req: Request, res: Response, next: NextFunction) => {
    try {

      if (!req.userId) throw new AppError("Unauthorized", 401);

      const data = await VerseEngagementService.userHistory(
        req.userId
      );

      res.json({ success: true, data });

    } catch (err) {
      next(err);
    }
  }
};