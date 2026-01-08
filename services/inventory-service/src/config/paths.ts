import { assetRoutes } from "src/routes/asset.route";
import { healthRouter } from "src/routes/health.route";
import { categoryRoutes } from "src/routes/inventory.route";
import { locationRoutes } from "src/routes/location.route";

// Route Groups
export const routeGroups = [
  {
    prefix: "/health",
    router: healthRouter,
  },
  {
    prefix: "/categories",
    router: categoryRoutes,
  },
  {
    prefix: "/assets",
    router: assetRoutes,
  },
  {
    prefix: "/locations",
    router: locationRoutes,
  },
];
