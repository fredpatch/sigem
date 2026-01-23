// export const VehicleDocumentType = {
//   PARKING_CARD: "PARKING_CARD",
//   INSURANCE: "INSURANCE",
//   TECH_INSPECTION: "TECH_INSPECTION",
//   REGISTRATION: "REGISTRATION",
//   TAX_STICKER: "TAX_STICKER",
//   EXTINGUISHER_CARD: "EXTINGUISHER_CARD",
//   OTHER: "OTHER",
// } as const;

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

// export type VehicleDocumentType =
//   (typeof VehicleDocumentType)[keyof typeof VehicleDocumentType];

// export interface VehicleDocument {
//   id: string;
//   vehicleId: {
//     plateNumber: string;
//     brand: string;
//     model: string;
//     id: string;
//   };
//   type: VehicleDocumentType;

//   reference?: string | null;
//   issuedAt?: string | null; // ISO string côté front
//   expiresAt: string; // ISO

//   reminderDaysBefore: number[];

//   lastNotificationAt?: string | null;
//   notificationsCount: number;

//   createdAt: string;
//   updatedAt: string;
// }
