import cron from "node-cron";
import { QuizDailyService } from "../modules/quiz/quizDaily.service";

cron.schedule("0 0 * * *", async () => {
  const today = new Date().toISOString().split("T")[0];
  try {
    await QuizDailyService.getToday();
    console.log("✅ Daily quiz created:", today);
  } catch (err) {
    console.error("❌ Daily quiz cron error", err);
  }
});