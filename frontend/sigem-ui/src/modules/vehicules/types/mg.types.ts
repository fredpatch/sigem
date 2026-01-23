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

  firstRegistrationDate?: string | null; // ISO string
  ownership?: string | null;
  acquisitionDate?: string | null;

  insuranceProvider?: string | null;
  insuranceIssuedAt?: string | null;
  insuranceExpiresAt?: string | null;

  extinguisherIssuedAt?: string | null;
  extinguisherExpiresAt?: string | null;

  techInspectionIssuedAt?: string | null;
  techInspectionExpiresAt?: string | null;

  parkingCardIssuedAt?: string | null;
  parkingCardExpiresAt?: string | null;

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

export type MgDocPayload = {
  reference?: string;
  provider?: string;
  issuedAt?: string; // ISO
  expiresAt: string; // ISO
  everyMonths?: number;
};

export type MgCreateVehiclePayload = {
  vehicle: {
    plateNumber: string;
    brand: string;
    model: string;
    type?: string;
    year?: number;

    currentMileage?: number;
    mileageUpdatedAt?: string;

    assignedToEmployeeMatricule?: string;
    assignedToName?: string;
    assignedToDirection?: string;
    assignedToFunction?: string;

    maintenanceNotes?: string;
  };
  documents?: {
    insurance?: MgDocPayload;
    techInspection?: MgDocPayload;
    extinguisher?: MgDocPayload;
    parkingCard?: MgDocPayload;
  };
};
