// src/features/vehicles/context/vehicle-tasks.context.tsx
import { VehicleTaskFilterQuery } from "../types/types";

export interface VehicleTasksContextValue {
  setFilters: (
    updater: (prev: VehicleTaskFilterQuery) => VehicleTaskFilterQuery
  ) => void;

  // KPIs pré-calculés
  kpis: {
    open: number;
    dueSoon: number;
    overdue: number;
    completed: number;
  };
}
