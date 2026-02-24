// Shared imports - formatters, scope, and http helpers
export {
  fmtDate,
  fmtDocType,
  fmtDue,
  fmtMileage,
  fmtVehicle,
} from "@sigem/shared/utils/formatters";

export { buildScopeFilter, type Scope } from "@sigem/shared/utils/scope";
export { getActor, type ActorInfo } from "@sigem/shared/http";
export { catchError, parseBool, parseIntSafe } from "@sigem/shared/http";

// Service-specific imports
export { IMPORTANT, KNOWN_TOPICS } from "./constants";

// Service-specific DTOs
export function toDTO(doc: any) {
  const p = doc.payload ?? {};

  const relatedResource = p.taskId
    ? { resourceType: p.resourceType ?? "VehicleTask", resourceId: p.taskId }
    : p.documentId
      ? {
          resourceType: p.resourceType ?? "VehicleDocument",
          resourceId: p.documentId,
        }
      : p.vehicleId
        ? { resourceType: p.resourceType ?? "Vehicle", resourceId: p.vehicleId }
        : p.assetId || p.resourceId
          ? {
              resourceType: p.resourceType ?? "Asset",
              resourceId: p.assetId ?? p.resourceId,
            }
          : undefined;

  return {
    id: doc._id.toString(),
    title: doc.title ?? doc.type,
    message: doc.message ?? "",
    type: doc.type,
    severity: doc.severity ?? "info",
    createdAt: doc.createdAt,
    isRead: !!doc.read,
    isDeleted: !!doc.deleted,
    payload: doc.payload,
    relatedResource,
  };
}

export type VehicleNotifyPayload = {
  type: string; // ex: "vehicle.task.overdue"
  severity?: "info" | "warning" | "critical" | "error" | "success";

  // ciblage (tu utilises déjà userId/role/recipients)
  userId?: string;
  role?: string;
  recipients?: string[];

  // ressources liées
  resourceType?: "VehicleTask" | "VehicleDocument" | "Vehicle";
  resourceId?: string;

  vehicleId?: string;
  vehiclePlate?: string; // ex: "GA-123-AA"
  vehicleLabel?: string; // ex: "Toyota Hilux"

  taskId?: string;
  taskLabel?: string; // ex: "Vidange"
  dueAt?: string | Date;
  dueMileage?: number;

  documentId?: string;
  documentType?: string; // ex: "INSURANCE"
  expiresAt?: string | Date;
  remainingDays?: number;
};
