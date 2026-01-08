import { Router } from "express";
import { z } from "zod";
import { CategoryController } from "../controllers/category.controller";
import { validateBody } from "src/middlewares/validateBody";
import { CategoryFamily } from "../models/category.model";
import { authenticate } from "src/middlewares/authenticate";
import { authorizedRoles } from "src/middlewares/authorized-roles";
import { audit } from "src/middlewares/audit";

const canWrite = authorizedRoles(
  "MG_COS",
  "MG_COB",
  "MG_AGT",
  "SUPER_ADMIN",
  "ADMIN"
);

const CreateSchema = z.object({
  code: z.string().min(2).max(12).optional(),
  label: z.string().min(2),
  family: z.nativeEnum(CategoryFamily),
  parentId: z.string().nullable().optional(), // null pour racine
  canonicalPrefix: z.string().min(1).max(12).optional(),
  description: z.string().optional(),
  allowedChildren: z.array(z.string()).optional(),
});

const UpdateSchema = CreateSchema.partial();

export const categoryRoutes = Router();

categoryRoutes.get("/", authenticate, CategoryController.list);
categoryRoutes.get("/:id", authenticate, CategoryController.get);

categoryRoutes.post(
  "/",
  authenticate,
  canWrite,
  validateBody(CreateSchema),
  audit("create", "Category"),
  CategoryController.create
);
categoryRoutes.patch(
  "/:id",
  authenticate,
  canWrite,
  validateBody(UpdateSchema),
  audit("update", "Category"),
  CategoryController.update
);
categoryRoutes.delete(
  "/:id/delete",
  authenticate,
  canWrite,
  audit("delete", "Category"),
  CategoryController.remove
);
