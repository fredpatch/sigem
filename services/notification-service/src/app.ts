import express from "express";
import middlewaresInit from "@sigem/shared/middleware";
import { router as rootRouter } from "./routes/index.route";

export const API_VERSION = "v1";

const initApp = async () => {
  const app = express();

  // Middlewares
  middlewaresInit(app, {
    cors: {
      allowlist: [],
      allowNoOrigin: true,
      credentials: true,
    },
  });

  // routes
  app.use("/", rootRouter());

  return app;
};

export default initApp;
