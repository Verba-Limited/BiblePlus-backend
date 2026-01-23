import { Request, Response, NextFunction } from "express";
import { ChatbotService } from "./chatbot.service";
import AppError from "../../core/AppError";

export const ChatbotController = {
  /* =====================================================
      SEND MESSAGE TO CHATBOT
      POST /api/chatbot/chat
  ===================================================== */
  chat: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Injected by auth middleware
      // @ts-ignore
      const userId = req.userId;

      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const { message } = req.body;

      if (!message || typeof message !== "string") {
        throw new AppError(
          "Message is required and must be a string",
          400
        );
      }

      const reply = await ChatbotService.chat(
        userId,
        message.trim()
      );

      res.status(200).json({
        success: true,
        data: reply,
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
      GET CHAT HISTORY
      GET /api/chatbot/history
  ===================================================== */
  history: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      const history = await ChatbotService.history(userId);

      res.status(200).json({
        success: true,
        data: history,
      });
    } catch (err) {
      next(err);
    }
  },

  /* =====================================================
      CLEAR CHAT HISTORY
      DELETE /api/chatbot/history
  ===================================================== */
  clearHistory: async (req: Request, res: Response, next: NextFunction) => {
    try {
      // @ts-ignore
      const userId = req.userId;

      if (!userId) {
        throw new AppError("Unauthorized", 401);
      }

      await ChatbotService.clearHistory(userId);

      res.status(200).json({
        success: true,
        message: "Chat history cleared successfully",
      });
    } catch (err) {
      next(err);
    }
  },
};