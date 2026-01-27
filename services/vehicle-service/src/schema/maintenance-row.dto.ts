export type MGMaintenanceRow = {
  id: string;
  plateNumber: string;
  type?: string | null;
  brand: string;
  model: string;
  energy?: string | null;
  assignedToName?: string | null;
  assignedToDirection?: string | null;
  fiscalPower?: number | null;

  firstRegistrationDate?: Date | null;
  ownership?: string | null;
  acquisitionDate?: Date | null;

  insuranceProvider?: string | null;

  insuranceIssuedAt?: Date | null;
  insuranceExpiresAt?: Date | null;

  extinguisherIssuedAt?: Date | null;
  extinguisherExpiresAt?: Date | null;

  techInspectionIssuedAt?: Date | null;
  techInspectionExpiresAt?: Date | null;

  parkingCardIssuedAt?: Date | null;
  parkingCardExpiresAt?: Date | null;

  lastTechVisitAt?: Date | null;
  nextTechVisitAt?: Date | null;

  oilChangeEveryKm?: number | null;
  lastOilChangeKm?: number | null;
  nextOilChangeKm?: number | null;

  lastCheckingKm?: number | null;

  maintenanceNotes?: string | null;

  createdAt?: Date;
  updatedAt?: Date;
};
