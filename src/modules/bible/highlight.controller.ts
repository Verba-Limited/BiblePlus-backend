import { Request, Response, NextFunction } from "express";
import { HighlightService } from "./highlight.service";

export const HighlightController = {
  // Create highlight
  createHighlight: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { book, chapter, verse, version } = req.body;

      const data = await HighlightService.createHighlight(
        userId,
        book,
        chapter,
        verse,
        version
      );

      res.json({
        success: true,
        message: "Verse highlighted",
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  // Get highlights for logged in user
  getHighlights: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const data = await HighlightService.getHighlights(userId);

      res.json({
        success: true,
        data,
      });
    } catch (err) {
      next(err);
    }
  },

  // Delete a highlight
  deleteHighlight: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { id } = req.params;

      const data = await HighlightService.deleteHighlight(userId, id);

      res.json({
        success: true,
        message: "Highlight deleted",
        data,
      });
    } catch (err) {
      next(err);
    }
  },
};
