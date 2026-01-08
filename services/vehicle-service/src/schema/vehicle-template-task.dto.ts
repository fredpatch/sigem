import {
  TaskTriggerType,
  VehicleTaskType,
} from "src/types/vehicle-task-template.type";

export interface CreateVehicleTaskTemplateDTO {
  code: string; // "VIDANGE_STD"
  label: string; // "Vidange standard"
  description?: string;

  type: VehicleTaskType; // OIL_CHANGE, DOCUMENT_RENEWAL, etc.
  triggerType: TaskTriggerType; // BY_DATE, BY_MILEAGE, BY_DATE_OR_MILEAGE

  everyKm?: number; // ex: 10000
  everyMonths?: number; // ex: 6

  noticeKmBefore?: number; // ex: 500
  noticeDaysBefore?: number; // ex: 14

  defaultSeverity?: "info" | "warning" | "critical"; // default: "warning"
  active?: boolean; // default: true
}

export interface UpdateVehicleTaskTemplateDTO {
  label?: string;
  description?: string;
  triggerType?: TaskTriggerType;
  everyKm?: number | null;
  everyMonths?: number | null;
  noticeKmBefore?: number | null;
  noticeDaysBefore?: number | null;
  defaultSeverity?: "info" | "warning" | "critical";
  active?: boolean;
}
