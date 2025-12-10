import { Router } from "express";
import authMiddleware from "../../middleware/auth.middleware";
import { ChatbotController } from "./chatbot.controller";

const router = Router();

// Chat with the AI chatbot
router.post("/chat", authMiddleware, ChatbotController.chat);

// Get chat history
router.get("/history", authMiddleware, ChatbotController.history);

// Clear chat history
router.delete("/history", authMiddleware, ChatbotController.clearHistory);

export default router;
