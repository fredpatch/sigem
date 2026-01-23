// vehicles/vehicle.route.ts
import { Router } from "express";
import { MgController } from "src/controller/vehicle-mg.controller";
import { VehicleTaskController } from "src/controller/vehicle-task.controller";
import { VehicleController } from "src/controller/vehicle.controller";
import {
  authenticate,
  authorizeVehicleOwnerByMatricule,
} from "src/middlewares/authenticate";
import { authorizedRoles } from "src/middlewares/authorized-roles";

const vehicleRouter = Router();
const vehicleTaskController = new VehicleTaskController();
const vehicleController = new VehicleController();
const canWrite = authorizedRoles("MG_COS", "MG_COB", "SUPER_ADMIN", "ADMIN");

const canRead = authorizedRoles(
  "MG_COS",
  "MG_COB",
  "MG_AGT",
  "SUPER_ADMIN",
  "ADMIN",
  "GUEST"
);

const mgController = new MgController();

// MG Routes
vehicleRouter.post(
  "/:vehicleId/mg/oil-change/complete",
  authenticate,
  mgController.completeOilChangeTask
);

vehicleRouter.post("/mg/create", authenticate, mgController.createMgVehicle);

// --- Vehicles ---
// Prefix final (via api-gateway) : /v1/vehicles

vehicleRouter.get("/mg-table", authenticate, vehicleController.getMgTable);
vehicleRouter.get("/my", authenticate, vehicleController.listMyVehicles);

vehicleRouter.post("/", authenticate, canWrite, vehicleController.create);

vehicleRouter.get("/", authenticate, canRead, vehicleController.list);

vehicleRouter.get("/:id", authenticate, canRead, vehicleController.listById);

vehicleRouter.patch("/:id", authenticate, canWrite, vehicleController.update);

vehicleRouter.get(
  "/:id/oil-change-info",
  authenticate,
  authorizeVehicleOwnerByMatricule,
  vehicleController.oilChangeInfo
);

vehicleRouter.patch(
  "/:id/mileage",
  authenticate,
  authorizeVehicleOwnerByMatricule,
  vehicleController.updateMileage
);

vehicleRouter.delete(
  "/:id",
  authenticate,
  canWrite,
  vehicleController.softDelete
);

// Création d'une tâche pour un véhicule
// Exposé via: POST /v1/vehicles/:vehicleId/tasks

vehicleRouter.post(
  "/:vehicleId/tasks",
  authenticate,
  canWrite,
  vehicleTaskController.createForVehicle
);
// Liste des tâches pour un véhicule donné
// GET /v1/vehicles/:vehicleId/tasks
vehicleRouter.get(
  "/:vehicleId/tasks",
  authenticate,
  canRead,
  vehicleTaskController.listByVehicle
);

export default vehicleRouter;
