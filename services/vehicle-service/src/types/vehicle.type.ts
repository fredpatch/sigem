export enum VehicleStatus {
  ACTIVE = "ACTIVE",
  IN_MAINTENANCE = "IN_MAINTENANCE",
  INACTIVE = "INACTIVE",
  RETIRED = "RETIRED",
}

// Type de véhicule (fonction / service / autre)
export enum VehicleUsageType {
  SERVICE = "SERVICE",
  FONCTION = "FONCTION",
  PICKUP = "PICKUP",
  SUV = "SUV",
  OTHER = "OTHER",
}

// Énergie
export enum VehicleEnergy {
  ESSENCE = "ESSENCE",
  DIESEL = "DIESEL",
  HYBRIDE = "HYBRIDE",
  ELECTRIQUE = "ELECTRIQUE",
  OTHER = "OTHER",
}

// Assurance
export enum VehicleInsuranceProvider {
  NSIA = "NSIA",
  INGENIUM = "INGENIUM",
  OTHER = "OTHER",
}

export interface Vehicle {
  id: string;

  // Identité
  plateNumber: string; // Immatriculation
  brand: string; // Marque
  model: string; // Modèle

  type?: string | null; // Berline, 4x4...
  year?: number | null;
  vin?: string | null;

  usageType?: VehicleUsageType | null; // ex: SERVICE / FONCTION
  energy?: VehicleEnergy | null; // Essence / Diesel / ...

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
  oilChangeFrequencyKm?: number | null; // Cadence vidange
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
