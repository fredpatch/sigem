// src/server.ts
import "reflect-metadata";
import getApp, { API_VERSION } from "./app";
import { MariaDataSource } from "./config/maria.datasource";
import connectToMongo from "./config/mongo";
import { initEvents } from "./core/events";

const PORT = Number(process.env.PORT || 4000);
const startServer = async () => {
  try {
    // init EventBus (based on EVENTS_DRIVER), "eager connect" for health
    await initEvents({ eager: true });

    // App
    const server = await getApp();

    // Mongo
    await connectToMongo();

    // Maria connect
    MariaDataSource.initialize()
      .then(() => console.log("MariaDB connected"))
      .catch((err) => {
        console.error("Error during MariaDB Data Source initialization:", err);
      });

    server.listen(PORT, "0.0.0.0", async () => {
      console.log(`🚀 API Gateway running on port ${PORT}`);
      console.log(
        `🟢 Health check: http://localhost:${PORT}/${API_VERSION}/health`
      );
    });
  } catch (error) {
    console.error(`Error starting Service: ${error}`);
  }
};

startServer();
