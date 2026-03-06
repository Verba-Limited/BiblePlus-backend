import { Request, Response, NextFunction } from "express";
import { VerseReactionService } from "./verseReaction.service";
import AppError from "../../core/AppError";

export const VerseReactionController = {

  async react(req: Request, res: Response, next: NextFunction) {
    try {

      if (!req.userId) {
        throw new AppError("Unauthorized", 401);
      }

      const data = await VerseReactionService.react(
        req.userId,
        req.params.id,
        req.body.reaction
      );

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  },

  async stats(req: Request, res: Response, next: NextFunction) {
    try {

      const data = await VerseReactionService.stats(
        req.params.id
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