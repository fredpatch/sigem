import { healthRouter } from "src/routes/health.route";
import vehicleDocumentRouter from "src/routes/vehicle-document.route";
import {
  vehicleTaskRouter,
  vehicleTaskTemplateRouter,
} from "src/routes/vehicle-task.route";
import vehicleRouter from "src/routes/vehicle.route";

// Route Groups
export const routeGroups = [
  {
    prefix: "/health",
    router: healthRouter,
  },
  {
    prefix: "/vehicles",
    router: vehicleRouter,
  },
  {
    prefix: "/vehicle-documents",
    router: vehicleDocumentRouter,
  },
  {
    prefix: "/vehicle-task-templates",
    router: vehicleTaskTemplateRouter,
  },
  {
    prefix: "/vehicle-tasks",
    router: vehicleTaskRouter,
  },
];
