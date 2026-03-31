import { employeeRouter } from "@/modules/employees/routes/employee-directory.route";
import userRouter from "@/modules/users/routes/user.route";
import { router as debugRouter } from "@/routes/_debug.router";
import { router as healthRouter } from "@/routes/health.router";
import authRouter from "@/modules/auth/routes/auth.router";

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
