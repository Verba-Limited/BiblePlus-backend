// src/modules/chatbot/chatbot.types.ts

export interface VerseItem {
  book: string;
  chapter: number;
  verse: number;
  text: string;
}

export interface ChatHistoryMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatMessageDocument {
  userId: string;
  role: "user" | "assistant";
  message: string;
  createdAt: Date;
}
