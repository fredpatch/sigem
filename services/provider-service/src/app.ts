import express, { Application } from "express";
import { providerRouter } from "./routes/provider.routes";
import { errorMiddleware } from "./middlewares/error.middleware";
import initMiddlewares from "./middlewares";
import { productRouter } from "./routes/products.route";
import { purchaseRouter } from "./routes/purchases.route";
import { purchaseRequestRouter } from "./routes/purchase-request.route";

export const API_VERSION = "v1";

const application = async () => {
  const app: Application = express();

  // middlewares init
  initMiddlewares(app);

  // routes
  app.use(`/${API_VERSION}`, purchaseRequestRouter);
  app.use(`/${API_VERSION}`, purchaseRouter);
  app.use(`/${API_VERSION}`, productRouter);
  app.use(`/${API_VERSION}`, providerRouter);

  // 404
  app.use((_req, res) =>
    res.status(404).json({
      status: "error",
      message: `Cannot ${_req.method} ${_req.originalUrl}`,
      suggestions: [
        "Check the API documentation at /docs",
        "Check the API routes information at api/docs",
        "Verify the API version in the URL",
        "Ensure the endpoint exists and the HTTP(S) method is correct",
      ],
    })
  );

  // errors
  app.use(errorMiddleware);

  return app;
};

export default application;
