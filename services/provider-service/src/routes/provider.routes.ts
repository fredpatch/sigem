import { Router } from "express";
import { authorizedRoles } from "../middlewares/authorized-roles";
import { providerController } from "../controllers/provider.controller";
import { authenticate } from "../middlewares/authenticate";
import multer from "multer";

export const providerRouter = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024 },
}); // 8MB

const canWrite = authorizedRoles(
  "MG_COS",
  "MG_COB",
  "MG_AGT",
  "SUPER_ADMIN",
  "ADMIN",
);

const canRead = authorizedRoles(
  "MG_COS",
  "MG_COB",
  "MG_AGT",
  "SUPER_ADMIN",
  "ADMIN",
);

/**
 * Stats
 */
providerRouter.get(
  "/providers/stats",
  authenticate,
  canRead,
  providerController.stats,
);

/**
 * Lecture
 */

providerRouter.get(
  "/providers/:providerId/catalog",
  authenticate,
  canRead,
  providerController.catalog,
);

providerRouter.get(
  "/providers",
  authenticate,
  canRead,
  providerController.list,
);

providerRouter.get(
  "/providers/:id",
  authenticate,
  canRead,
  providerController.getOne,
);

/**
 * Écriture
 */
providerRouter.post(
  "/providers",
  authenticate,
  canWrite,
  providerController.create,
);

providerRouter.patch(
  "/providers/:id",
  authenticate,
  canWrite,
  providerController.update,
);

providerRouter.delete(
  "/providers/:id",
  authenticate,
  canWrite,
  providerController.disable, // soft delete
);

providerRouter.post(
  "/providers/:id/activate",
  authenticate,
  canWrite,
  providerController.activate,
);

// Import preview
providerRouter.post(
  "/providers/import/preview",
  authenticate,
  canWrite,
  upload.single("file"),
  providerController.importPreview,
);

// Import Inspect
providerRouter.post(
  "/providers/import/inspect",
  authenticate,
  canWrite,
  upload.single("file"),
  providerController.importInspect,
);

// Import commit
providerRouter.post(
  "/providers/import/commit",
  authenticate,
  canWrite,
  providerController.importCommit,
);
