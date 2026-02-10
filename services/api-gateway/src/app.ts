import express, { Application } from "express";
import middlewaresInit from "./middlewares";
import { inventoryProxyRouter } from "./routes/inventory.proxy.router";
import { router } from "./routes";
import { vehicleProxyRouter } from "./routes/vehicles.proxy.router";
import { notificationProxyRouter } from "./routes/notifications.proxy.router";
import { referenceProxyRouter } from "./routes/references.proxy.router";
import { providerProxyRouter } from "./routes/providers.proxy.router";
import { productProxyRouter } from "./routes/products.proxy.router";
import { supplierProxyRouter } from "./routes/supplier.proxy.router";
import { stocksProxyRouter } from "./routes/stocks.proxy.router";

export const API_VERSION = "v1";

const getApp = async () => {
  const app: Application = express();

  // middlewares init
  middlewaresInit(app);

  // routes
  // Proxy routes
  app.use("/", productProxyRouter);
  app.use("/", stocksProxyRouter);
  app.use("/", providerProxyRouter);
  app.use("/", supplierProxyRouter);
  app.use("/", notificationProxyRouter);
  app.use("/", referenceProxyRouter);
  app.use("/", inventoryProxyRouter);
  app.use("/", vehicleProxyRouter);
  app.use("/", router());

  return app;
};

export default getApp;
