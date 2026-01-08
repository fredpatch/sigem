// src/types/vehicle.types.ts
export type VehicleStatus =
  | "ACTIVE"
  | "IN_MAINTENANCE"
  | "INACTIVE"
  | "RETIRED"; // adapte à ton enum réel

export type MyVehicle = {
  id: string;
  plateNumber: string;
  brand: string;
  model: string;
  type?: string;
  year?: number;
  energy?: string;
  usageType?: string;
  currentMileage: number;
  mileageUpdatedAt: string;
  assignedToName?: string;
  assignedToDirection?: string | null;
  assignedToFunction?: string | null;
};

// Type de véhicule (fonction / service / autre)
export type VehicleUsageType =
  | "SERVICE"
  | "FONCTION"
  | "PICKUP"
  | "SUV"
  | "OTHER";

// Énergie
export type VehicleEnergy =
  | "ESSENCE"
  | "DIESEL"
  | "HYBRIDE"
  | "ELECTRIQUE"
  | "OTHER";

// Assurance
export type VehicleInsuranceProvider = "NSIA" | "INGENIUM" | "OTHER";

export interface Vehicle {
  id: string;

  // Identité
  plateNumber: string;
  brand: string;
  model: string;

  type?: string | null; // Berline, 4x4...
  year?: number | null;

  usageType?: VehicleUsageType | null;
  energy?: VehicleEnergy | null;

  averageConsumption?: number | null; // L / 100km
  fiscalPower?: number | null; // CV

  // Dates administratives
  acquisitionDate?: string | null; // ISO
  firstRegistrationDate?: string | null; // Date 1ère immat

  // Propriété / propriétaire
  ownership?: string | null; // ex: "ANAC"

  // Assurance
  insuranceProvider?: VehicleInsuranceProvider | null;
  insuranceValidity?: string | null; // ISO

  // Carte extincteur
  extinguisherCardValidity?: string | null; // ISO

  // Visite technique
  lastTechnicalVisitDate?: string | null;
  nextTechnicalVisitDate?: string | null;

  // Vidange
  oilChangeFrequencyKm?: number | null;
  lastOilChangeKm?: number | null;
  nextOilChangeKm?: number | null;

  // Checking
  lastCheckingKm?: number | null;

  // Compteur km
  currentMileage: number;
  mileageUpdatedAt: string;

  // Affectation
  assignedToEmployeeId?: string | null;
  assignedToName?: string | null;
  assignedToDirection?: string | null;

  dept: string;
  status: VehicleStatus;

  maintenanceNotes?: string | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleDTO {
  plateNumber: string;
  brand: string;
  model: string;
  type?: string | null;
  year?: number | null;

  usageType?: VehicleUsageType | null;
  energy?: VehicleEnergy | null;
  averageConsumption?: number | null;
  fiscalPower?: number | null;

  acquisitionDate?: string | null;
  firstRegistrationDate?: string | null;

  ownership?: string | null;

  insuranceProvider?: VehicleInsuranceProvider | null;
  insuranceValidity?: string | null;
  extinguisherCardValidity?: string | null;

  lastTechnicalVisitDate?: string | null;
  nextTechnicalVisitDate?: string | null;

  oilChangeFrequencyKm?: number | null;
  lastOilChangeKm?: number | null;
  nextOilChangeKm?: number | null;

  lastCheckingKm?: number | null;

  currentMileage: number;
  mileageUpdatedAt?: string | null;

  assignedToEmployeeMatricule?: string | null;
  assignedToName?: string | null;
  assignedToDirection?: string | null;
  assignedToFunction?: string | null;

  status?: VehicleStatus;
  dept?: string;

  maintenanceNotes?: string | null;
}

export interface ListVehiclesQuery {
  matriculate?: string;
  page?: number;
  limit?: number;
  status?: VehicleStatus;
  search?: string;
  assigned?: "yes" | "no";
}

export interface UpdateVehicleDTO extends Partial<CreateVehicleDTO> {}

export interface UpdateVehicleMileageDTO {
  currentMileage: number;
  mileageUpdatedAt?: string | null;
}

export interface PaginatedVehicles {
  items: Vehicle[];
  total: number;
  page: number;
  limit: number;
}
