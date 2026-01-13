export type MGMaintenanceRow = {
  id: string;
  plateNumber: string;
  type?: string | null;
  brand: string;
  model: string;
  energy?: string | null;
  assignedToName?: string | null;
  fiscalPower?: number | null;

  firstRegistrationDate?: string | null; // ISO string
  ownership?: string | null;
  acquisitionDate?: string | null;

  insuranceProvider?: string | null;
  insuranceExpiresAt?: string | null;

  extinguisherExpiresAt?: string | null;

  lastTechVisitAt?: string | null;
  nextTechVisitAt?: string | null;

  oilChangeEveryKm?: number | null;
  lastOilChangeKm?: number | null;
  nextOilChangeKm?: number | null;

  lastCheckingKm?: number | null;

  maintenanceNotes?: string | null;
};

export type MgUpdateVehicleOilChangeDTO = {
  completedMileage: number;
  completedAt?: string; // ISO
  completionComment?: string;
};
