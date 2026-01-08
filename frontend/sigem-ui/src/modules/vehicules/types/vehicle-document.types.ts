export const VehicleDocumentType = {
  PARKING_CARD: "PARKING_CARD",
  INSURANCE: "INSURANCE",
  TECH_INSPECTION: "TECH_INSPECTION",
  REGISTRATION: "REGISTRATION",
  TAX_STICKER: "TAX_STICKER",
  EXTINGUISHER_CARD: "EXTINGUISHER_CARD",
  OTHER: "OTHER",
} as const;

export type VehicleDocumentType =
  (typeof VehicleDocumentType)[keyof typeof VehicleDocumentType];

export interface VehicleDocument {
  id: string;
  vehicleId: {
    plateNumber: string;
    brand: string;
    model: string;
    id: string;
  };
  type: VehicleDocumentType;

  reference?: string | null;
  issuedAt?: string | null; // ISO string côté front
  expiresAt: string; // ISO

  reminderDaysBefore: number[];

  lastNotificationAt?: string | null;
  notificationsCount: number;

  createdAt: string;
  updatedAt: string;
}
