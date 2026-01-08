import { Router } from "express";
import { AssetController } from "../controllers/asset.controller";
import { authenticate } from "src/middlewares/authenticate";
import { validateBody, validateQuery } from "src/middlewares/validateBody";
import { authorizedRoles } from "src/middlewares/authorized-roles";
import { audit } from "src/middlewares/audit";
import { CreateSchema, ListQuery, UpdateSchema } from "src/schema/asset.schema";

const canWrite = authorizedRoles(
  "MG_COS",
  "MG_COB",
  "MG_AGT",
  "SUPER_ADMIN",
  "ADMIN"
);

export const assetRoutes = Router();

assetRoutes.get(
  "/",
  authenticate,
  validateQuery(ListQuery),
  AssetController.list
);
assetRoutes.get("/:id", authenticate, AssetController.get);
assetRoutes.post(
  "/",
  authenticate,
  canWrite,
  validateBody(CreateSchema),
  audit("create", "Asset"),
  AssetController.create
);
assetRoutes.patch(
  "/:id",
  authenticate,
  canWrite,
  validateBody(UpdateSchema),
  audit("update", "Asset"),
  AssetController.update
);
assetRoutes.delete(
  "/:id/delete",
  authenticate,
  canWrite,
  audit("delete", "Asset"),
  AssetController.remove
);
