import express, { Application } from "express";
import middlewaresInit from "./middlewares";
import { inventoryProxyRouter } from "./routes/inventory.proxy.router";
import { router } from "./routes";
import { vehicleProxyRouter } from "./routes/vehicles.proxy.router";
import { notificationProxyRouter } from "./routes/notifications.proxy.router";
import { referenceProxyRouter } from "./routes/references.proxy.router";

export const API_VERSION = "v1";

const getApp = async () => {
  const app: Application = express();

  // middlewares init
  middlewaresInit(app);

  // routes
  // Proxy routes
  app.use("/", notificationProxyRouter);
  app.use("/", referenceProxyRouter);
  app.use("/", inventoryProxyRouter);
  app.use("/", vehicleProxyRouter);
  app.use("/", router());

  return app;
};

export default getApp;
