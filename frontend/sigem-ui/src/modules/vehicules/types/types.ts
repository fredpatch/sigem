// src/features/vehicles/types/vehicle-tasks.types.ts

export type VehicleTaskSeverity = "info" | "warning" | "critical";

export type VehicleRefKey =
  | "vehicle.brand"
  | "vehicle.model"
  | "vehicle.type"
  | "vehicle.ownership"
  | "vehicle.assignedToDirection";


export type VehicleStatus =
  | "ACTIVE"
  | "IN_MAINTENANCE"
  | "INACTIVE"
  | "RETIRED"; // adapte à ton enum rée

export type VehicleTaskStatus =
  | "PLANNED"
  | "DUE_SOON"
  | "OVERDUE"
  | "COMPLETED"
  | "CANCELLED";

export type VehicleDocumentType =
  | "PARKING_CARD"
  | "INSURANCE"
  | "TECH_INSPECTION"
  | "REGISTRATION"
  | "EXTINGUISHER_CARD"
  | "OTHER";

export type TaskTriggerType = "BY_DATE" | "BY_MILEAGE" | "BY_DATE_OR_MILEAGE";

export type VehicleTaskType =
  | "OIL_CHANGE"
  | "MAINTENANCE"
  | "DOCUMENT_RENEWAL"
  | "OTHER";

export interface VehicleTask {
  _id: string;
  vehicleId: string;
  vehicleDocumentId: string;
  vehicleLabel?: string;
  vehiclePlate?: string;

  templateId?: string;

  type: VehicleTaskType;
  label: string;
  description?: string;

  // Cibles
  dueAt?: string | null; // ISO
  dueMileage?: number | null;

  status: VehicleTaskStatus;
  severity: VehicleTaskSeverity;

  lastNotificationAt?: string | null;
  notificationsCount: number;

  // Clôture
  completedAt?: string | null;
  completedMileage?: number | null;
  completionComment?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleTaskDTO {
  vehicleId: string;
  vehicleDocumentId?: string;
  dept: string;

  // --- Option 1: à partir d’un template ---
  templateId?: string;

  // --- Option 2: tâche manuelle ---
  type?: VehicleTaskType;
  triggerType?: TaskTriggerType;
  label?: string;
  description?: string;

  dueAt?: string | null; // ISO date
  dueMileage?: number | null;

  severity?: VehicleTaskSeverity; // default "warning" côté backend
}

// Query pour /v1/vehicle-tasks
export interface VehicleTaskFilterQuery {
  page?: number;
  limit?: number;

  status?: VehicleTaskStatus | "OPEN"; // "OPEN" = PLANNED + DUE_SOON + OVERDUE
  severity?: VehicleTaskSeverity;
  vehicleId?: string;
  type?: VehicleTaskType;

  dueBefore?: string; // ISO
  dueAfter?: string; // ISO
}

export interface VehicleTaskListResponse {
  items: VehicleTask[];
  total: number;
  page: number;
  limit: number;
}

export interface CompleteVehicleTaskDTO {
  completedAt?: Date; // default now backend-side
  completedMileage?: number;
  completionComment?: string;
}

export interface UpdateVehicleTaskDTO {
  label?: string;
  description?: string;
  dueAt?: string | null;
  dueMileage?: number | null;
  severity?: VehicleTaskSeverity;
  status?: VehicleTaskStatus; // ex: CANCELLED
}

export interface VehicleTaskTemplate {
  id: string;
  dept: string;
  label: string;
  description?: string;
  type: VehicleTaskType;
  triggerType: TaskTriggerType;
  documentType?: VehicleDocumentType;
  defaultSeverity: VehicleTaskSeverity;
  active: boolean;
  createdAt: string;
  updatedAt: string;

  requiresDocument?: boolean;
  everyKm?: number | null;
  everyMonths?: number | null;
  noticeKmBefore?: number | null;
  noticeDaysBefore?: number | null;
}

export interface CreateVehicleTaskTemplateDTO {
  dept: string;
  label: string;
  description?: string | null;
  type: "OIL_CHANGE" | "MAINTENANCE" | "DOCUMENT_RENEWAL" | "OTHER";
  triggerType: "BY_DATE" | "BY_MILEAGE" | "BY_DATE_OR_MILEAGE";
  documentType?: VehicleDocumentType | null;
  everyKm?: number | null;
  everyMonths?: number | null;
  noticeKmBefore?: number | null;
  noticeDaysBefore?: number | null;
  defaultSeverity?: "info" | "warning" | "critical";
  active?: boolean;
  requiresDocument?: boolean; // 🆕
}

export interface UpdateVehicleTaskTemplateDTO {
  label?: string;
  description?: string;
  type?: "OIL_CHANGE" | "MAINTENANCE" | "DOCUMENT_RENEWAL" | "OTHER";
  triggerType?: "BY_DATE" | "BY_MILEAGE" | "BY_DATE_OR_MILEAGE";
  documentType: VehicleDocumentType | null;
  everyKm?: number | null;
  everyMonths?: number | null;
  noticeKmBefore?: number | null;
  noticeDaysBefore?: number | null;
  defaultSeverity?: "info" | "warning" | "critical";
  active?: boolean;
  requiresDocument?: boolean; // 🆕 (à gérer aussi côté API update)
}
