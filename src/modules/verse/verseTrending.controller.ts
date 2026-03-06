import { Request, Response, NextFunction } from "express";
import { VerseTrendingService } from "./verseTrending.service";

export const VerseTrendingController = {

  async trending(req: Request, res: Response, next: NextFunction) {
    try {

      const limit = Number(req.query.limit) || 10;

      const data = await VerseTrendingService.getTrending(limit);

      res.json({
        success: true,
        data
      });

    } catch (err) {
      next(err);
    }
  }

};