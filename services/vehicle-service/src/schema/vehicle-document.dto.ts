import {
  VehicleDocument as VehicleDocumentAttrs,
  VehicleDocumentType,
} from "src/types/vehicle-document.type";

export interface CreateVehicleDocumentDTO {
  vehicleId: string;
  type: VehicleDocumentType; // PARKING_CARD, INSURANCE, etc.
  reference?: string;
  issuedAt?: string; // ISO
  expiresAt: string; // ISO

  reminderDaysBefore?: number[]; // ex: [30, 15, 7]
}

export interface UpdateVehicleDocumentDTO {
  reference?: string;
  issuedAt?: string;
  expiresAt?: string;
  reminderDaysBefore?: number[];
}

export interface CreateVehicleDocumentInput {
  vehicleId: string;
  type: VehicleDocumentAttrs["type"];
  reference?: string;
  issuedAt?: Date;
  expiresAt: Date;

  reminderDaysBefore?: number[];
}
