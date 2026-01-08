import cron from "node-cron";
import { runVehicleTaskScheduler } from "src/jobs/vehicle-task.scheduler";
import { runVehicleDocumentScheduler } from "./jobs/vehicle-document.scheduler";

export function initSchedulers() {
  // Tous les jours à 02:00 du matin
  cron.schedule("0 2 * * *", async () => {
    try {
      await runVehicleTaskScheduler();
      await runVehicleDocumentScheduler();
    } catch (error) {
      console.error("[vehicle-task.scheduler] Error:", error);
    }
  });

  // Optionnel: pour dev, un cron toutes les minutes
  // if (process.env.NODE_ENV === "development") {
  //   cron.schedule("*/5 * * * *", async () => {
  //     try {
  //       console.log("[vehicle-task.scheduler] Dev run (every 5 min)...");
  //       await runVehicleTaskScheduler();
  //       await runVehicleDocumentScheduler();
  //     } catch (error) {
  //       console.error("[vehicle-task.scheduler] Dev Error:", error);
  //     }
  //   });
  // }

  console.log("[scheduler] Vehicle task scheduler initialized");
}
