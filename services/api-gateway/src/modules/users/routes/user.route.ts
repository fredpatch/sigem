import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticate } from "src/middlewares/authenticate";
import { authorizedRoles } from "src/middlewares/authorized-roles";

const userRouter = Router();

userRouter.post(
  "/:id/deactivate",
  authenticate,
  // require2FA,
  authorizedRoles("SUPER_ADMIN", "ADMIN"),
  UserController.deactivate
);

// Prefix:: /api/v1/users
userRouter.get("/", authenticate, UserController.list);
userRouter.get("/:id", authenticate, UserController.listById);
userRouter.get(
  "/by-matricule/:matricule",
  authenticate,
  UserController.listByMatricule
);
userRouter.delete(
  "/:id/delete",
  authenticate,
  authorizedRoles("ADMIN", "SUPER_ADMIN"),
  UserController.softDelete
);
userRouter.patch(
  "/:id",
  authenticate,
  authorizedRoles("ADMIN", "SUPER_ADMIN"),
  UserController.update
);
userRouter.patch(
  "/:id/reset",
  authenticate,
  authorizedRoles("ADMIN", "SUPER_ADMIN"),
  UserController.resetPassword
);

export default userRouter;
