import getApp, { API_VERSION } from "./app";
import { env } from "./config/env";
import { connectToMongo } from "@sigem/shared";
import { ensureKafkaTopics } from "./core/ensure-topics";
import { initSchedulers } from "./scheduler";
import { initEvents } from "./core/events";
import { runVehicleTaskScheduler } from "./jobs/vehicle-task.scheduler";
import { runVehicleDocumentScheduler } from "./jobs/vehicle-document.scheduler";

// src/server.ts
const startServer = async () => {
  const kafkaBrokers = env.KAFKA_BROKERS.split(",")
    .map((b) => b.trim())
    .filter(Boolean);

  // init EventBus (based on EVENTS_DRIVER), "eager connect" for health
  await initEvents({ eager: true });

  // App
  const server = await getApp();

  // Mongo
  const uri = process.env.MONGO_URL;
  if (!uri) {
    throw new Error("MONGO_URL missing");
  }

  const mongoSsl = process.env.MONGO_SSL === "true";

  await connectToMongo({
    uri,
    options: { ssl: mongoSsl },
  });

  if (env.EVENTS_DRIVER === "kafka" && kafkaBrokers.length > 0) {
    await ensureKafkaTopics(kafkaBrokers);
  } else {
    console.log("[kafka] Topic provisioning skipped (no brokers configured)");
  }

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
