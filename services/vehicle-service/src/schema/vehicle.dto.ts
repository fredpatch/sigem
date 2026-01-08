import {
  VehicleEnergy,
  VehicleUsageType,
  VehicleStatus,
} from "src/types/vehicle.type";

export interface CreateVehicleDTO {
  plateNumber: string;
  brand: string;
  model: string;

  type?: string;
  year?: number;

  // nouveaux
  usageType?: VehicleUsageType;
  energy?: VehicleEnergy;
  averageConsumption?: number;
  fiscalPower?: number;
  acquisitionDate?: Date;
  firstRegistrationDate?: Date;
  ownership?: string;

  currentMileage: number;
  mileageUpdatedAt?: Date;

  assignedToEmployeeMatricule?: string;
  assignedToName?: string;
  assignedToDirection?: string;
  assignedToFunction?: string;

  maintenanceNotes?: string;

  status?: VehicleStatus;
  dept: string;
}

export interface ListVehiclesQuery {
  matriculate?: string; // ex: "MG"
  page?: number;
  limit?: number;
  status?: VehicleStatus; // ACTIVE, IN_MAINTENANCE...
  search?: string; // filter plate/brand/model
  assigned?: "yes" | "no"; // filtrer véhicules affectés / non affectés
}

export interface UpdateVehicleDTO {
  plateNumber?: string;
  brand?: string;
  model?: string;

  type?: string;
  year?: number;

  usageType?: VehicleUsageType;
  energy?: VehicleEnergy;
  averageConsumption?: number;
  fiscalPower?: number;
  acquisitionDate?: Date;
  firstRegistrationDate?: Date;
  ownership?: string;

  currentMileage?: number;
  mileageUpdatedAt?: Date;

  maintenanceNotes?: string;

  assignedToEmployeeMatricule?: string | null;
  assignedToName?: string | null;
  assignedToDirection?: string;
  assignedToFunction?: string | null;

  status?: VehicleStatus;
}

export interface UpdateVehicleMileageDTO {
  currentMileage: number;
  mileageUpdatedAt?: string; // ISO, sinon now
}
