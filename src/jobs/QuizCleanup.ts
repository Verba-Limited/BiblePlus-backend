import cron from "node-cron";
import { QuizDaily } from "../modules/quiz/quizDaily.model";

export const startDailyQuizCleanup = () => {

  // Runs every day at 00:00 (midnight)
  cron.schedule("0 0 * * *", async () => {
    try {
      console.log("Running daily quiz cleanup...");
      await QuizDaily.deleteMany({});
      console.log("Daily quiz cleared.");
    } catch (err) {
      console.error("❌ Daily quiz cleanup failed:", err);
    }
  });
};