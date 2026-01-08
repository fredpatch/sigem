// src/routes/vehicles/vehicle-task.route.ts
import { Router } from "express";
import { authenticate } from "src/middlewares/authenticate";
import { authorizedRoles } from "src/middlewares/authorized-roles";
import {
  VehicleTaskTemplateController,
  VehicleTaskController,
} from "src/controller/vehicle-task.controller";

const vehicleTaskRouter = Router();
const vehicleTaskTemplateRouter = Router();

const templateController = new VehicleTaskTemplateController();
const taskController = new VehicleTaskController();

/* COS: Chief of Service | COB: Chief of Bureau | AGT: Agent */
const canWrite = authorizedRoles("MG_COS", "MG_COB", "SUPER_ADMIN", "ADMIN");
const canRead = authorizedRoles(
  "MG_COS",
  "MG_COB",
  "MG_AGT",
  "SUPER_ADMIN",
  "ADMIN"
);

// --- TASK TEMPLATES ---
// Exposé via gateway: /v1/vehicle-task-templates (par ex., selon ton proxy)

vehicleTaskTemplateRouter.post(
  "/task-templates",
  authenticate,
  canWrite,
  templateController.create
);

vehicleTaskTemplateRouter.get(
  "/task-templates",
  authenticate,
  canRead,
  templateController.list
);

vehicleTaskTemplateRouter.get(
  "/task-templates/:id",
  authenticate,
  canRead,
  templateController.getById
);

vehicleTaskTemplateRouter.patch(
  "/task-templates/:id",
  authenticate,
  canWrite,
  templateController.update
);

// --- TASKS ---
// Création d'une tâche pour un véhicule
// Exposé via: POST /v1/vehicles/:vehicleId/tasks

// router.post(
//   "/vehicles/:vehicleId/tasks",
//   authenticate,
//   canWrite,
//   taskController.createForVehicle
// );

// Liste globale des tâches (écran Monitoring MG)
// GET /v1/vehicle-tasks
vehicleTaskRouter.get("/", authenticate, canRead, taskController.list);

// Liste des tâches pour un véhicule donné
// GET /v1/vehicles/:vehicleId/tasks
// router.get(
//   "/vehicles/:vehicleId/tasks",
//   authenticate,
//   canRead,
//   taskController.listByVehicle
// );

// Détail, update, complete par id
// GET /v1/vehicle-tasks/:id
vehicleTaskRouter.get("/:id", authenticate, canRead, taskController.getById);

// PATCH /v1/vehicle-tasks/:id
vehicleTaskRouter.patch("/:id", authenticate, canWrite, taskController.update);

// POST /v1/vehicle-tasks/:id/complete
vehicleTaskRouter.post(
  "/:id/complete",
  authenticate,
  canWrite,
  taskController.complete
);

export { vehicleTaskRouter, vehicleTaskTemplateRouter };
