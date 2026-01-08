import { VehicleTaskType } from "./vehicle-task-template.type";

export enum VehicleTaskStatus {
  PLANNED = "PLANNED",
  DUE_SOON = "DUE_SOON",
  OVERDUE = "OVERDUE",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
}

export interface VehicleTask {
  _id: string;
  vehicleId: string;
  templateId?: string;

  type: VehicleTaskType;
  label: string; // "Vidange 35.000 → 45.000 km"
  description?: string;

  // Cible temporelle
  dueAt?: Date;
  // Cible kilométrique
  dueMileage?: number; // ex: prochaine vidange à 75.000 km

  status: VehicleTaskStatus;
  severity: "info" | "warning" | "critical";

  lastNotificationAt?: Date;
  notificationsCount: number;

  // Clôture
  completedAt?: Date;
  completedMileage?: number;
  completionComment?: string;

  createdAt: Date;
  updatedAt: Date;
}
