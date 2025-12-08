import { Request, Response, NextFunction } from "express";
import { EventCommentService } from "./eventComment.service";

export const EventCommentController = {
  add: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { eventId, text } = req.body;

      const data = await EventCommentService.addComment(userId, eventId, text);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      // @ts-ignore
      const isAdmin = req.isAdmin || false;

      const { id } = req.params;

      const data = await EventCommentService.deleteComment(id, userId, isAdmin);
      res.json({ success: true, data });
    } catch (err) {
      next(err);
    }
  },

  list: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const comments = await EventCommentService.getComments(req.params.eventId);
      res.json({ success: true, data: comments });
    } catch (err) {
      next(err);
    }
  }
};
