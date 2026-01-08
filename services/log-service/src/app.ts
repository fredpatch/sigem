import express, { Application } from "express";
import { router as rootRouter } from "./routes/index.route";
import middlewaresInit from "./middlewares";

export const API_VERSION = "v1";

const initApp = async () => {
  const app: Application = express();

  // Middlewares
  middlewaresInit(app);

  // routes
  app.use("/", rootRouter());

  return app;
};

export default initApp;
