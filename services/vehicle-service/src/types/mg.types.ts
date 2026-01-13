import { VehicleTaskStatus } from "./vehicle-task.types";

export const OPEN_STATUSES = [
  VehicleTaskStatus.OVERDUE,
  VehicleTaskStatus.DUE_SOON,
  VehicleTaskStatus.PLANNED,
] as const;

export function statusRank(s: string) {
  switch (s) {
    case VehicleTaskStatus.OVERDUE:
      return 1;
    case VehicleTaskStatus.DUE_SOON:
      return 2;
    case VehicleTaskStatus.PLANNED:
      return 3;
    default:
      return 9;
  }
}
