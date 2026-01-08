import { VehicleTaskStatus } from "src/types/task-planned.type";
import { VehicleDocumentType } from "src/types/vehicle-document.type";
import {
  TaskSeverity,
  TaskTriggerType,
  VehicleTaskType,
} from "src/types/vehicle-task-template.type";

export type CreateVehicleTaskTemplateDTO = {
  dept: string;
  label: string;
  description?: string;

  type: VehicleTaskType;
  triggerType: TaskTriggerType;

  everyKm?: number;
  everyMonths?: number;

  noticeKmBefore?: number;
  noticeDaysBefore?: number;

  requiresDocument?: boolean;

  defaultSeverity?: TaskSeverity;

  documentType?: VehicleDocumentType;
  active?: boolean;
};

export type UpdateVehicleTaskTemplateDTO = Partial<
  Omit<CreateVehicleTaskTemplateDTO, "code" | "dept">
> & {
  active?: boolean;
};

export type CreateVehicleTaskDTO = {
  dept: string;
  vehicleId: string;
  templateId?: string;

  vehicleDocumentId?: string;
  requiresDocument?: boolean;

  type?: VehicleTaskType; // req si pas de templateId
  triggerType?: TaskTriggerType;

  label?: string;
  description?: string;

  dueAt?: Date;
  dueMileage?: number;

  severity?: "info" | "warning" | "critical";
};

export interface UpdateVehicleTaskDTO {
  label?: string;
  description?: string;
  vehicleDocumentId?: string;
  dueAt?: string | null;
  dueMileage?: number | null;
  severity?: "info" | "warning" | "critical";
  status?: VehicleTaskStatus; // ex: CANCELLED
}

export type CompleteVehicleTaskDTO = {
  completedAt?: Date;
  completedMileage?: number;
  completionComment?: string;
};

export type ListVehicleTasksQuery = {
  dept?: string;
  page?: number;
  limit?: number;
  status?: VehicleTaskStatus | "OPEN"; // OPEN = PLANNED + DUE_SOON + OVERDUE
  severity?: "info" | "warning" | "critical";
  vehicleId?: string;
  type?: VehicleTaskType;
  dueBefore?: Date;
  dueAfter?: Date;
};
