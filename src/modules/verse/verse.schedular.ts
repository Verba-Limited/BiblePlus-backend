// src/modules/verse/verse.scheduler.ts
import cron from "node-cron";
import { VerseService } from "./verse.service";

/*
|--------------------------------------------------------------------------
| Runs every day at 00:00 (server time)
|--------------------------------------------------------------------------
*/
export const startVerseScheduler = () => {
  cron.schedule("0 0 * * *", async () => {
    console.log("⏰ Generating Verse of the Day...");

    try {
      await VerseService.getToday();
      console.log("✅ Verse of the Day generated successfully");
    } catch (error) {
      console.error("❌ Failed to generate Verse of the Day");
    }
  });
};