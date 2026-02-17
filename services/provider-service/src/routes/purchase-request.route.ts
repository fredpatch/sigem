import { Router } from "express";
import { authorizedRoles } from "../middlewares/authorized-roles";
import { authenticate } from "../middlewares/authenticate";
import { purchaseRequestController } from "../controllers/purchase-request.controller";
import { audit } from "../middlewares/audit";

export const purchaseRequestRouter = Router();

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
 * Lecture
 */

purchaseRequestRouter.get(
  "/purchase-requests",
  authenticate,
  canRead,
  purchaseRequestController.list,
);

purchaseRequestRouter.get(
  "/purchase-requests/:id",
  authenticate,
  canRead,
  purchaseRequestController.details,
);

/**
 * Écriture
 */
purchaseRequestRouter.post(
  "/purchase-requests",
  authenticate,
  audit("create", "purchase_request"),
  canWrite,
  purchaseRequestController.createRequest,
);

purchaseRequestRouter.post(
  "/purchase-requests/:id/action",
  authenticate,
  audit("transition", "purchase_request"),
  canWrite,
  purchaseRequestController.transition,
);

purchaseRequestRouter.post(
  "/purchase-requests/:id/convert",
  authenticate,
  audit("convert", "purchase_request"),
  canWrite,
  purchaseRequestController.convertToPurchase,
);
