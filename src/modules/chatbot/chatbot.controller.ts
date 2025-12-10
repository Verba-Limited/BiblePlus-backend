// src/modules/chatbot/chatbot.controller.ts

import { Request, Response, NextFunction } from "express";
import { ChatbotService } from "./chatbot.service";

export const ChatbotController = {
  // -----------------------------------------------------
  // CHATBOT MESSAGE
  // -----------------------------------------------------
  chat: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Injected from auth middleware
      // @ts-ignore
      const userId = req.userId;
      const { message } = req.body;

      const reply = await ChatbotService.chat(userId, message);

      res.json({ success: true, data: reply });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // GET CHAT HISTORY
  // -----------------------------------------------------
  history: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      const history = await ChatbotService.history(userId);

      res.json({ success: true, data: history });
    } catch (err) {
      next(err);
    }
  },

  // -----------------------------------------------------
  // CLEAR USER CHAT HISTORY
  // -----------------------------------------------------
  clearHistory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      await ChatbotService.clearHistory(userId);

      res.json({
        success: true,
        message: "Chat history cleared successfully",
      });
    } catch (err) {
      next(err);
    }
  },
};
