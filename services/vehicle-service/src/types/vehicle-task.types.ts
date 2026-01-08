import {
  TaskSeverity,
  TaskTriggerType,
  VehicleTaskType,
} from "./vehicle-task-template.type";

export enum VehicleTaskStatus {
  PLANNED = "PLANNED", // créée mais encore loin
  DUE_SOON = "DUE_SOON", // dans la fenêtre de préavis
  OVERDUE = "OVERDUE", // en retard
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface VehicleTask {
  vehicleId?: string; // ObjectId du véhicule
  templateId?: string; // Optionnel: lié à un template

  vehicleDocumentId?: string; // Link to the vehicle document; a task should be planned using a vehicle's document

  type: VehicleTaskType;
  triggerType: TaskTriggerType;

  label: string; // "Vidange 35 000 → 45 000 km"
  description?: string;

  // Échéances
  dueAt?: Date; // cible date (pour BY_DATE, BY_DATE_OR_MILEAGE)
  dueMileage?: number; // cible km (pour BY_MILEAGE, BY_DATE_OR_MILEAGE)

  status: VehicleTaskStatus;
  severity: TaskSeverity;

  // Notifications / alertes
  lastNotificationAt?: Date;
  lastNotifiedState?: "DUE_SOON" | "OVERDUE";
  notificationsCount: number;

  // Clôture
  completedAt?: Date;
  completedMileage?: number;
  completionComment?: string;

  // Portée
  dept: string; // "MG"

  createdAt: Date;
  updatedAt: Date;
}
