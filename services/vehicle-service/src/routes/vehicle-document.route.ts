import { Router } from "express";
import { VehicleDocumentController } from "src/controller/vehicle.controller";
import { audit } from "src/middlewares/audit";
import { authenticate } from "src/middlewares/authenticate";
import { authorizedRoles } from "src/middlewares/authorized-roles";

const vehicleDocumentRouter = Router();
const document = new VehicleDocumentController();
const canWrite = authorizedRoles("MG_COS", "MG_COB", "SUPER_ADMIN", "ADMIN");

const canRead = authorizedRoles(
  "MG_COS",
  "MG_COB",
  "MG_AGT",
  "SUPER_ADMIN",
  "ADMIN",
);

// --- Vehicle documents ---
// Nested sous /v1/vehicle-documents/:vehicleId/documents

vehicleDocumentRouter.post(
  "/:vehicleId/documents",
  authenticate,
  audit("create_vehicle_document", "document"),
  canWrite,
  document.create,
);

vehicleDocumentRouter.get(
  "/:vehicleId/documents",
  authenticate,
  canRead,
  document.listByVehicle,
);

vehicleDocumentRouter.get("/", authenticate, canRead, document.list);

// Accès direct par id de document : /v1/vehicle-documents/:id
// => à monter soit ici avec un autre router dans l'api-gateway
// Pour rester simple on ajoute les routes ici avec un prefix clair côté gateway.

vehicleDocumentRouter.get(
  "/documents/:id",
  authenticate,
  canRead,
  document.getById,
);

vehicleDocumentRouter.patch(
  "/documents/:id",
  authenticate,
  audit("update_vehicle_document", "document"),
  canWrite,
  document.update,
);

vehicleDocumentRouter.delete(
  "/documents/:id",
  authenticate,
  audit("delete_vehicle_document", "document"),
  canWrite,
  document.delete,
);

export default vehicleDocumentRouter;
