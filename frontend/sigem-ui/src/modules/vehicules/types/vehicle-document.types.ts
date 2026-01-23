export type VehicleDocumentType =
  | "INSURANCE"
  | "TECH_INSPECTION"
  | "PARKING_CARD"
  | "EXTINGUISHER_CARD";

export type VehicleDocument = {
  id: string;
  vehicleId: string;
  type: VehicleDocumentType;
  reference?: string | null;
  issuedAt?: string | null;
  expiresAt: string;
  reminderDaysBefore: number[];
  // optionnel si tu le stockes dans la doc insurance
  provider?: string | null;
};

export type UpsertVehicleDocumentPayload = {
  vehicleId: string;
  type: VehicleDocumentType;
  reference?: string;
  issuedAt?: string; // ISO
  expiresAt: string; // ISO
  reminderDaysBefore?: number[];
  provider?: string; // insurance only
};
