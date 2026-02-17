import { Router } from "express";
import { authorizedRoles } from "../middlewares/authorized-roles";
import { authenticate } from "../middlewares/authenticate";
import { productController } from "../controllers/products.controller";
import { audit } from "../middlewares/audit";

export const productRouter = Router();

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
productRouter.get(
  "/products/:productId/price-compare",
  authenticate,
  canRead,
  productController.compare,
);

productRouter.get("/products", authenticate, canRead, productController.list);

productRouter.get(
  "/products/:id",
  authenticate,
  canRead,
  productController.getOne,
);

/**
 * Écriture
 */
productRouter.post(
  "/products",
  authenticate,
  audit("create", "product"),
  canWrite,
  productController.create,
);

productRouter.patch(
  "/products/:id",
  authenticate,
  audit("update", "product"),
  canWrite,
  productController.update,
);

// productRouter.delete(
//   "/products/:id",
//   authenticate,
//   canWrite,
//   productController.disable // soft delete
// );

// productRouter.post(
//   "/products/:id/activate",
//   authenticate,
//   canWrite,
//   productController.activate
// );
