import express, { Application } from "express";
import middlewaresInit from "./middlewares";
import { errorHandler } from "./middlewares/error-handlers";
import { notFoundHandler } from "./middlewares/not-found";
import { router as vehicleRouter } from "./routes";

export const API_VERSION = "v1";

const getApp = async () => {
  const app: Application = express();

  // middlewares init
  middlewaresInit(app);

  // routes
  app.use("/", vehicleRouter());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default getApp;
