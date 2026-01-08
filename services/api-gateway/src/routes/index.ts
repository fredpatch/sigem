import { Router, Request, Response } from "express";
// import swaggerJSDoc from "swagger-jsdoc";
// import { swaggerOptions } from "../config/swagger";
// import swaggerUi from "swagger-ui-express";
import { routeGroups } from "../config/routes.path";
import { API_VERSION } from "../app";

export const router = () => {
  // Swagger configuration
  // const swaggerSpec = swaggerJSDoc(swaggerOptions);
  const routesHandler = Router();

  // Mount routes
  routeGroups.forEach(({ prefix, router: groupRouter }) => {
    routesHandler.use(`/${API_VERSION}${prefix}/`, groupRouter);
  });

  // API Information route
  routesHandler.get("/", (_req: Request, res: Response) => {
    res.json({
      info: `SIGEM Gateway ${API_VERSION}`,
      version: API_VERSION,
      timestamp: new Date().toLocaleDateString(),
      author: "Anac Gabon",
      endpoints: {
        health: `/${API_VERSION}/health`,
        debug: `/${API_VERSION}/_debug`,
        notifications: `/${API_VERSION}/notification`,
        auth: `/${API_VERSION}/auth`,
        inventory: `/${API_VERSION}/inventory`,
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
