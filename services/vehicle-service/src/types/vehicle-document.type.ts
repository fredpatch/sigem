// vehicle-documents.type.ts
export enum VehicleDocumentType {
  PARKING_CARD = "PARKING_CARD", // Carte de parking
  INSURANCE = "INSURANCE", // Assurance (NSIA, INGENIUM, ...)
  TECH_INSPECTION = "TECH_INSPECTION", // Visite technique
  REGISTRATION = "REGISTRATION", // Carte grise
  TAX_STICKER = "TAX_STICKER", // Vignette/taxe

  EXTINGUISHER_CARD = "EXTINGUISHER_CARD", // ✅ Carte extincteur
  OTHER = "OTHER", // ✅ Document divers / générique
}

export interface VehicleDocument {
  vehicleId: string;
  type: VehicleDocumentType;

  reference?: string; // Numéro police, réf carte, etc.
  issuedAt?: Date;
  expiresAt: Date;

  // Nombre de jours avant expiration pour générer des alertes
  reminderDaysBefore: number[]; // ex: [30, 15, 7]

  lastNotificationAt?: Date;
  notificationsCount: number;

  createdAt: Date;
  updatedAt: Date;
}
