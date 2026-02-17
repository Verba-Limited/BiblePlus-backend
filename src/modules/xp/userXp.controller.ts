import { Request, Response, NextFunction } from "express";
import { UserXpService } from "./userXp.service";

export const UserXpController = {

  ranking: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = Number(req.query.limit) || 20;

      const data = await UserXpService.getGlobalRanking(limit);

      res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  },

  profile: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await UserXpService.getProfile(req.userId!);

      res.json({
        success: true,
        data
      });
    } catch (err) {
      next(err);
    }
  }
};