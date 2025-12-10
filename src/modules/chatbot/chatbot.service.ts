// src/modules/chatbot/chatbot.service.ts

import axios from "axios";
import AppError from "../../core/AppError";
import { ChatMessage } from "./chatbot.model";
import { VerseFinder } from "./helpers/verseFinder";

export type ChatRole = "user" | "assistant";

export const ChatbotService = {
  // -----------------------------------------------------
  // SEND MESSAGE TO AI + GENERATE REPLY
  // -----------------------------------------------------
  chat: async (userId: string, message: string) => {
    if (!message) throw new AppError("Message is required", 400);

    // Save user message
    await ChatMessage.create({
      userId,
      role: "user",
      message,
    });

    // Load last 10 messages for conversation context
    const history = await ChatMessage.find({ userId })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    const formattedHistory = history.reverse().map((msg: any) => ({
      role: msg.role,
      content: msg.message,
    }));

    // Extract Bible verses automatically
    const verses = (VerseFinder as any).searchVerses(message, "kjv");

    let verseContext = "";
    if (verses.length > 0) {
      verseContext =
        "\n\nRelevant Bible Verses:\n" +
        verses
          .map(
            (v: any) =>
              `${v.book} ${v.chapter}:${v.verse} — ${v.text}`
          )
          .join("\n");
    }

    // System Instructions
    const systemPrompt = {
      role: "system",
      content:
        "You are BiblePlus AI — a Christian faith assistant. " +
        "You answer with biblical wisdom, encouragement, and relevant Bible verses. " +
        "Always respond with love, compassion, and accuracy.",
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
            content: message + verseContext,
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

    const reply = response.data.choices[0].message.content;

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
