import { Router } from "express";
import { authorizedRoles } from "../middlewares/authorized-roles";
import { authenticate } from "../middlewares/authenticate";
import { purchasesController } from "../controllers/purchases.controller";

export const purchaseRouter = Router();

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
 * Lecture
 */
purchaseRouter.get(
  "/purchases",
  authenticate,
  canRead,
  purchasesController.list
);

purchaseRouter.get(
  "/purchases/:id",
  authenticate,
  canRead,
  purchasesController.getOne
);

/**
 * Écriture
 */
purchaseRouter.post(
  "/purchases",
  authenticate,
  canWrite,
  purchasesController.create
);

purchaseRouter.post(
  "/purchases/:id/confirm",
  authenticate,
  canWrite,
  purchasesController.confirm
);

purchaseRouter.patch(
  "/purchases/:id",
  authenticate,
  canWrite,
  purchasesController.update
);

purchaseRouter.delete(
  "/purchases/:id/cancel",
  authenticate,
  canWrite,
  purchasesController.cancel // soft delete
);

// productRouter.post(
//   "/products/:id/activate",
//   authenticate,
//   canWrite,
//   productController.activate
// );
