import { Router } from "express";
import { authorizedRoles } from "../middlewares/authorized-roles";
import { providerController } from "../controllers/provider.controller";
import { authenticate } from "../middlewares/authenticate";

export const providerRouter = Router();

const canWrite = authorizedRoles(
  "MG_COS",
  "MG_COB",
  "MG_AGT",
  "SUPER_ADMIN",
  "ADMIN"
);

const canRead = authorizedRoles(
  "MG_COS",
  "MG_COB",
  "MG_AGT",
  "SUPER_ADMIN",
  "ADMIN"
);

/**
 * Stats
 */
providerRouter.get(
  "/providers/stats",
  authenticate,
  canRead,
  providerController.stats
);

/**
 * Lecture
 */
providerRouter.get(
  "/providers",
  authenticate,
  canRead,
  providerController.list
);

providerRouter.get(
  "/providers/:id",
  authenticate,
  canRead,
  providerController.getOne
);

/**
 * Écriture
 */
providerRouter.post(
  "/providers",
  authenticate,
  canWrite,
  providerController.create
);

providerRouter.patch(
  "/providers/:id",
  authenticate,
  canWrite,
  providerController.update
);

providerRouter.delete(
  "/providers/:id",
  authenticate,
  canWrite,
  providerController.disable // soft delete
);

providerRouter.post(
  "/providers/:id/activate",
  authenticate,
  canWrite,
  providerController.activate
);
