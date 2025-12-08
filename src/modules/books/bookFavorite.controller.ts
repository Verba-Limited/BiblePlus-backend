import { Request, Response, NextFunction } from "express";
import { BookFavoriteService } from "./bookFavorite.service";

export const BookFavoriteController = {
  add: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { bookId } = req.body;

      const fav = await BookFavoriteService.addFavorite(userId, bookId);

      res.json({ success: true, data: fav });
    } catch (err) {
      next(err);
    }
  },

  remove: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;
      const { bookId } = req.body;

      await BookFavoriteService.removeFavorite(userId, bookId);

      res.json({ success: true, message: "Favorite removed" });
    } catch (err) {
      next(err);
    }
  },

  all: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const favs = await BookFavoriteService.getFavorites(userId);

      res.json({ success: true, data: favs });
    } catch (err) {
      next(err);
    }
  }
};
