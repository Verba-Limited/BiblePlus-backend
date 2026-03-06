import { Response, NextFunction } from "express";
import { AuthRequest } from "../../types/auth.types";
import { VerseEngagementService } from "./verseEngagement.service";
import AppError from "../../core/AppError";

export const VerseEngagementController = {

  /* ================= LIKE / UNLIKE ================= */
  like: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

      if (!req.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const data = await VerseEngagementService.like(
        req.userId,
        req.params.id
      );

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  },


  /* ================= COMMENT / REPLY ================= */
  comment: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

      if (!req.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const { comment, parentComment } = req.body;

      const data = await VerseEngagementService.comment(
        req.userId,
        req.params.id,
        comment,
        parentComment
      );

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  },


  /* ================= GET COMMENTS ================= */
  comments: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

      const data = await VerseEngagementService.getComments(
        req.params.id
      );

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  },


  /* ================= SHARE ================= */
  share: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

      if (!req.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const data = await VerseEngagementService.share(
        req.userId,
        req.params.id
      );

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  },


  /* ================= STATS ================= */
  stats: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

      const data = await VerseEngagementService.stats(
        req.params.id
      );

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  },


  /* ================= USER HISTORY ================= */
  history: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {

      if (!req.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const data = await VerseEngagementService.userHistory(
        req.userId
      );

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  }

};