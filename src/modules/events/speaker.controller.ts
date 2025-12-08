import { Request, Response, NextFunction } from "express";
import { SpeakerService } from "./speaker.service";

export const SpeakerController = {
  create: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const speaker = await SpeakerService.createSpeaker(req.body);
      res.json({ success: true, data: speaker });
    } catch (err) {
      next(err);
    }
  },

  update: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const speaker = await SpeakerService.updateSpeaker(
        req.params.id,
        req.body
      );
      res.json({ success: true, data: speaker });
    } catch (err) {
      next(err);
    }
  },

  delete: async (req: Request, res: Response, next: NextFunction) => {
    try {
      await SpeakerService.deleteSpeaker(req.params.id);
      res.json({ success: true, message: "Speaker deleted" });
    } catch (err) {
      next(err);
    }
  },

  getAll: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const speakers = await SpeakerService.getAllSpeakers();
      res.json({ success: true, data: speakers });
    } catch (err) {
      next(err);
    }
  },

  getOne: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const speaker = await SpeakerService.getSpeaker(req.params.id);
      res.json({ success: true, data: speaker });
    } catch (err) {
      next(err);
    }
  }
};
