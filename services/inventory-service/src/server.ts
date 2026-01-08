import getApp, { API_VERSION } from "./app";
import { env } from "./config/env";
import { logger } from "./config/logger";
import connectToMongo from "./config/mongo";
import { initEvents } from "./core/events";
// src/server.ts
const startServer = async () => {
  // init EventBus (based on EVENTS_DRIVER), "eager connect" for health
  await initEvents({ eager: true });

  // App
  const server = await getApp();

  // Mongo
  await connectToMongo();

  server.listen(env.PORT, "0.0.0.0", async () => {
    // logger.info(
    //   { port: env.PORT, env: env.NODE_ENV },
    //   "Inventory-service is running"
    // );
    console.log(`🚀 ${env.SERVICE_NAME} running on ${env.PORT}`);
    console.log(
      `🟢 Health check: http://localhost:${env.PORT}/${API_VERSION}/health`
    );
  });
};

startServer().catch((err) => {
  // logger.error({ err }, "Fatal error during bootstrap");
  console.error(`Error starting Service: ${err}`);
  process.exit(1);
});
