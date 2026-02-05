import cron from "node-cron";
import { QuizService } from "../modules/quiz/quiz.service";

cron.schedule("0 0 * * *", async () => {
  const today = new Date().toISOString().split("T")[0];
  try {
    await QuizService.ensureDailyQuiz(today);
    console.log("✅ Daily quiz created:", today);
  } catch (err) {
    console.error("❌ Daily quiz cron error", err);
  }
});