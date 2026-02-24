import getApp, { API_VERSION } from "./app";
import { env } from "./config/env";
import connectToMongo from "./config/mongo";
import { ensureKafkaTopics } from "./core/ensure-topics";
import { initSchedulers } from "./scheduler";
import { initEvents } from "./core/events";
import { runVehicleTaskScheduler } from "./jobs/vehicle-task.scheduler";
import { runVehicleDocumentScheduler } from "./jobs/vehicle-document.scheduler";

// src/server.ts
const startServer = async () => {
  // init EventBus (based on EVENTS_DRIVER), "eager connect" for health
  await initEvents({ eager: true });

  // App
  const server = await getApp();

  // Mongo
  await connectToMongo();

  await ensureKafkaTopics(env.KAFKA_BROKERS.split(",").map((b) => b.trim()));

  // Tasks monitoring
  initSchedulers();

  // await runVehicleTaskScheduler();
  // await runVehicleDocumentScheduler();

  server.listen(env.PORT, "0.0.0.0", async () => {
    console.log(`🚀 ${env.SERVICE_NAME} running on ${env.PORT}`);
    console.log(
      `🟢 Health check: http://localhost:${env.PORT}/${API_VERSION}/health`,
    );
  });
};

startServer().catch((err) => {
  // logger.error({ err }, "Fatal error during bootstrap");
  console.error(`Error starting Service: ${err}`);
  process.exit(1);
});
