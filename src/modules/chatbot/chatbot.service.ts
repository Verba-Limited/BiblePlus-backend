// src/modules/chatbot/chatbot.service.ts

import axios from "axios";
import AppError from "../../core/AppError";
import { ChatMessage } from "./chatbot.model";

export type ChatRole = "user" | "assistant";

interface OpenAIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export const ChatbotService = {
  // -----------------------------------------------------
  // SEND MESSAGE TO AI + GENERATE REPLY
  // -----------------------------------------------------
  chat: async (userId: string, message: string): Promise<string> => {
    if (!message) throw new AppError("Message is required", 400);

    // Save user message
    await ChatMessage.create({
      userId,
      role: "user",
      message,
    });

    // Load last 10 messages for context
    const history = await ChatMessage.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const formattedHistory: OpenAIMessage[] = history
      .reverse()
      .map((msg: any) => ({
        role: msg.role,
        content: msg.message,
      }));

    // System Instructions
    const systemPrompt: OpenAIMessage = {
      role: "system",
      content:
        "You are BiblePlus AI — a Christian faith assistant. " +
        "Give biblical explanations, encouragement, and scripture references when relevant. " +
        "Always respond with love, clarity, and biblical accuracy.",
    };

    // Call OpenAI API
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          systemPrompt,
          ...formattedHistory,
          {
            role: "user",
            content: message,
          },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    const reply: string =
      response.data?.choices?.[0]?.message?.content ??
      "I’m sorry, I couldn’t generate a response right now.";

    // Save bot reply
    await ChatMessage.create({
      userId,
      role: "assistant",
      message: reply,
    });

    return reply;
  },

  // -----------------------------------------------------
  // GET CHAT HISTORY (last 50 messages)
  // -----------------------------------------------------
  history: async (userId: string) => {
    return await ChatMessage.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);
  },

  // -----------------------------------------------------
  // CLEAR ALL CHAT HISTORY FOR USER
  // -----------------------------------------------------
  clearHistory: async (userId: string) => {
    await ChatMessage.deleteMany({ userId });
    return true;
  },
};