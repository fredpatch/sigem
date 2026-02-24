import { Router } from "express";
import { authenticate } from "../../../middlewares/authenticate";
import { authorizedRoles } from "../../../middlewares/authorized-roles";
import { authController } from "../controllers/auth.controller";
import { require2FA } from "src/middlewares/require2FA";
import { audit } from "src/middlewares/audit";

const authRouter = Router();

// Prefix:: /auth-service/auth

authRouter.post("/register", authController.registerHandler);
authRouter.post("/login", authController.loginHandler);
authRouter.post("/logout", authController.logoutHandler);

// MG account activate employee route
authRouter.post(
  "/mg/activate",
  authenticate,
  audit("activate_user", "auth"),
  authorizedRoles("SUPER_ADMIN", "ADMIN", "MG_COS"),
  authController.activateUserHandler,
);
authRouter.post(
  "/mg/deactivate",
  authenticate,
  audit("deactivate_user", "auth"),
  authorizedRoles("SUPER_ADMIN", "ADMIN", "MG_COS"),
  authController.deactivateUserHandler,
);
authRouter.patch(
  "/mg/role",
  authenticate,
  audit("update_user_role", "auth"),
  authorizedRoles("SUPER_ADMIN", "ADMIN", "MG_COS"),
  authController.updateUserRoleHandler,
);

// First login set password route
authRouter.post("/set-password", authController.firstLoginSetPasswordHandler);

/* Protected routes */
authRouter.get(
  "/me",
  authenticate,
  audit("verify_user", "auth"),
  authController.getMeHandler,
);

/* 2FA routes */
authRouter.post("/request-otp", authController.requestOtpHandler);
authRouter.post("/verify-otp", authController.verifyOtpHandler);

export default authRouter;
