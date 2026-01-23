// src/modules/vehicle/vehicle-document.model.ts
import { Schema, model, type HydratedDocument, type Model } from "mongoose";
import { VehicleDocumentType } from "src/types/vehicle-document.type";

export interface VehicleDocument {
  vehicleId: Schema.Types.ObjectId; // ObjectId du véhicule (stringifié côté TS)
  type: VehicleDocumentType;

  reference?: string; // Numéro police, réf carte, etc.
  issuedAt?: Date;
  expiresAt: Date;
  provider?: string; // Assureur, prestataire, etc.

  reminderDaysBefore: number[]; // ex.: [30, 15, 7]

  lastNotificationAt?: Date;
  notificationsCount: number;

  createdAt: Date;
  updatedAt: Date;
}

export type VehicleDocumentDoc = HydratedDocument<VehicleDocument>;
export type VehicleDocumentModel = Model<VehicleDocument>;

const VehicleDocumentSchema = new Schema<VehicleDocument>(
  {
    vehicleId: {
      type: Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: Object.values(VehicleDocumentType),
      required: true,
      index: true,
    },
    reference: {
      type: String,
      trim: true,
    },
    issuedAt: {
      type: Date,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    provider: {
      type: String,
      trim: true,
    },
    reminderDaysBefore: {
      type: [Number],
      default: [30, 15, 7],
    },
    lastNotificationAt: {
      type: Date,
    },
    notificationsCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    collection: "vehicle_documents",
  },
);

// Index utile : un document de type X par véhicule (optionnel mais conseillé)
VehicleDocumentSchema.index(
  { vehicleId: 1, type: 1 },
  { unique: false }, // mets true si tu veux un seul doc de chaque type par véhicule
);

// Normalisation JSON
VehicleDocumentSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const VehicleDocumentEntity = model<
  VehicleDocument,
  VehicleDocumentModel
>("VehicleDocument", VehicleDocumentSchema);
