import { Router } from "express";
import { z } from "zod";
import { LocationController } from "../controllers/location.controller";
import { authenticate } from "src/middlewares/authenticate";
import { authorizedRoles } from "src/middlewares/authorized-roles";
import { validateBody, validateQuery } from "src/middlewares/validateBody";
import { audit } from "src/middlewares/audit";

const canWrite = authorizedRoles("MG_COS", "MG_COB", "MG_AGT");

const CreateSchema = z.object({
  localisation: z.string().min(1).trim(),
  batiment: z.string().min(1).trim(),
  direction: z.string().min(1).trim(),
  bureau: z.string().min(1).trim(),
  code: z.string().min(1).trim().optional(), // généré si absent
  path: z.string().min(1).trim().optional(), // généré si absent
  level: z.enum(["LOCALISATION", "BATIMENT", "DIRECTION", "BUREAU"]).optional(),
  notes: z.string().optional(),
});

const UpdateSchema = CreateSchema.partial();

const ListQuery = z.object({
  search: z.string().optional(),
  localisation: z.string().optional(),
  batiment: z.string().optional(),
  direction: z.string().optional(),
  bureau: z.string().optional(),
  page: z.coerce.number().int().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export const locationRoutes = Router();

locationRoutes.get(
  "/",
  // authenticate,
  // validateQuery(ListQuery),
  LocationController.list
);
locationRoutes.get("/:id", authenticate, LocationController.get);
locationRoutes.post(
  "/",
  // authenticate,
  // canWrite,
  validateBody(CreateSchema),
  audit("create", "Location"),
  LocationController.create
);
locationRoutes.patch(
  "/:id",
  // authenticate,
  // canWrite,
  validateBody(UpdateSchema),
  audit("update", "Location"),
  LocationController.update
);
locationRoutes.delete(
  "/:id/delete",
  // authenticate,
  // canWrite,
  audit("delete", "Location"),
  LocationController.remove
);
