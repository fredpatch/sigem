import { healthRouter } from "../routes/health.route";
import routes from "../routes/notifications.route";

export const routeGroups = [
  {
    prefix: "/notifications",
    router: routes,
  },
  {
    prefix: "/health",
    router: healthRouter,
  },
];
