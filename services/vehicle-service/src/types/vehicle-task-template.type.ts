import { VehicleDocumentType } from "./vehicle-document.type";

export enum TaskTriggerType {
  BY_DATE = "BY_DATE",
  BY_MILEAGE = "BY_MILEAGE",
  BY_DATE_OR_MILEAGE = "BY_DATE_OR_MILEAGE",
}

export enum VehicleTaskType {
  OIL_CHANGE = "OIL_CHANGE", // Vidange
  MAINTENANCE = "MAINTENANCE", // Entretien général
  DOCUMENT_RENEWAL = "DOCUMENT_RENEWAL", // Renouvellement doc (assurance, parking, etc.)
  OTHER = "OTHER",
}

export type TaskSeverity = "info" | "warning" | "critical";

export interface VehicleTaskTemplate {
  code: string; // "VIDANGE_STD"
  label: string; // "Vidange standard"
  description?: string;

  type: VehicleTaskType;
  triggerType: TaskTriggerType;

  // Triggers kilométriques
  everyKm?: number; // ex: 10000

  // Triggers calendrier
  everyMonths?: number; // ex: 6

  // Préavis
  noticeKmBefore?: number; // ex: 500 km avant dueMileage
  noticeDaysBefore?: number; // ex: 14 jours avant dueAt

  defaultSeverity: TaskSeverity; // défaut: "warning"

  // Portée (ici MG par défaut, comme le reste du module)
  dept: string;

  documentType: VehicleDocumentType;
  requiresDocument?: boolean;
  active: boolean;

  createdAt: Date;
  updatedAt: Date;
}
