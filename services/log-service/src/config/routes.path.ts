import { routes as logRoutes } from "../routes/logs.route";
import { healthRouter } from "../routes/health.route";

export const routeGroups = [
  {
    prefix: "/logs",
    router: logRoutes,
  },
  {
    prefix: "/health",
    router: healthRouter,
  },
];
