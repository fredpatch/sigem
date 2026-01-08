import { Router, Request, Response } from "express";
// import swaggerJSDoc from "swagger-jsdoc";
// import { swaggerOptions } from "../config/swagger";
// import swaggerUi from "swagger-ui-express";
import { routeGroups } from "../config/paths";
import { API_VERSION } from "../app";

export const router = () => {
  // Swagger configuration
  // const swaggerSpec = swaggerJSDoc(swaggerOptions);
  const routesHandler = Router();

  // const isProd = process.env.NODE_ENV === "production";

  // API Documentation routes
  // if (!isProd) {
  //   routesHandler.use(`/${API_VERSION}/docs`, swaggerUi.serve);
  //   routesHandler.get(`/${API_VERSION}/docs`, swaggerUi.setup(swaggerSpec));
  //   routesHandler.get(`/${API_VERSION}/docs.js`, (_, res) => {
  //     res.setHeader("Content-Type", "application/json");
  //     res.send(swaggerSpec);
  //   });
  // }

  // Mount routes
  routeGroups.forEach(({ prefix, router: groupRouter }) => {
    routesHandler.use(`/${API_VERSION}${prefix}/`, groupRouter);
  });

  // API Information route
  routesHandler.get("/", (_req: Request, res: Response) => {
    res.json({
      info: `SIGEM Vehicle-Service ${API_VERSION}`,
      version: API_VERSION,
      timestamp: new Date().toLocaleDateString(),
      author: "Anac Gabon",
      endpoints: {
        health: `/${API_VERSION}/health`,
        debug: `/${API_VERSION}/_debug`,
        vehicles: `/${API_VERSION}/vehicles`,
      },
    });
  });

  // handle 404
  routesHandler.use("*splat", (_req: Request, res: Response) => {
    res.status(404).json({
      status: "error",
      message: `Cannot ${_req.method} ${_req.originalUrl}`,
      suggestions: [
        "Check the API documentation at /docs",
        "Check the API routes information at api/docs",
        "Verify the API version in the URL",
        "Ensure the endpoint exists and the HTTP(S) method is correct",
      ],
    });
  });

  return routesHandler;
};
