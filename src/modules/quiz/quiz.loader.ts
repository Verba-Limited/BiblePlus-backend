import fs from "fs";
import path from "path";

export const QuizLoader = {
  questions: [] as any[],

  load() {
    const dataPath = path.join(__dirname, "../../data/quiz.json");

    try {
      const file = fs.readFileSync(dataPath, "utf8");
      const json = JSON.parse(file);
      this.questions = json.questions || [];
      console.log("✔ Quiz JSON loaded successfully:", this.questions.length, "questions");
    } catch (err: any) {
      console.error("❌ Failed to load quiz.json:", err.message);
      this.questions = [];
    }
  }
};
