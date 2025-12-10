import axios from "axios";
import { NotificationService } from "../../notifications/notification.service";

export const DevotionalService = {
  generateDaily: async () => {
    const prompt = `Create a short Christian devotional (6 sentences max).
Include:
- Title
- One Bible verse (KJV)
- Explanation
- Closing short prayer.`;

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: prompt }]
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const content = response.data.choices[0].message.content;

    // Broadcast to all users
    await NotificationService.create(
      "ALL",
      "Daily Devotional",
      content,
      "devotional",
      {}
    );

    return content;
  }
};
