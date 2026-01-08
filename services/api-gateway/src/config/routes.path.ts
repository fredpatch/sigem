import authRouter from "src/modules/auth/routes/auth.router";
import { router as healthRouter } from "../routes/health.router";
import { router as debugRouter } from "src/routes/_debug.router";
import { router as notificationsProxy } from "src/routes/notifications.proxy";
import userRouter from "src/modules/users/routes/user.route";
import { employeeRouter } from "src/modules/employees/routes/employee-directory.route";
// import { vehicleProxyRouter } from "src/routes/vehicles.proxy.router";

// Route Groups
export const routeGroups = [
  {
    prefix: "/health",
    router: healthRouter,
  },
  {
    prefix: "/_debug",
    router: debugRouter,
  },
  {
    prefix: "/auth",
    router: authRouter,
  },
  {
    prefix: "/users",
    router: userRouter,
  },
  {
    prefix: "/directory",
    router: employeeRouter,
  },
];
