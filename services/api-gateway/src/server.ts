// src/server.ts
import "reflect-metadata";
import getApp, { API_VERSION } from "./app";
import { initializeMariaIfConfigured } from "./config/maria.datasource";
import { initEvents } from "./core/events";
import { connectToMongo } from "@sigem/shared";
import { initSuperAdminBootstrap } from "./bootstrap/init-super-admin";

const PORT = Number(process.env.PORT || 4000);
const startServer = async () => {
  try {
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
    await initSuperAdminBootstrap();

    // Maria connect
    await initializeMariaIfConfigured();

    server.listen(PORT, "0.0.0.0", async () => {
      console.log(`🚀 API Gateway running on port ${PORT}`);
      console.log(
        `🟢 Health check: http://localhost:${PORT}/${API_VERSION}/health`,
      );
    });
  } catch (error) {
    console.error(`Error starting Service: ${error}`);
  }
};

startServer();
