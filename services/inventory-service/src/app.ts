import { Application } from "express";
import middlewaresInit from "./middlewares";
import express from "express";
import { router as inventoryRoutes } from "./routes";
import { notFoundHandler } from "./middlewares/not-found";
import { errorHandler } from "./middlewares/error-handlers";

export const API_VERSION = "v1";

const getApp = async () => {
  const app: Application = express();

  // middlewares init
  middlewaresInit(app);

  // routes
  app.use("/", inventoryRoutes());

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default getApp;
