// src/modules/vehicle/vehicle.model.ts
import { Schema, model as MongoModel, type Model } from "mongoose";
import {
  VehicleEnergy,
  VehicleStatus,
  VehicleUsageType,
} from "src/types/vehicle.type";

export interface VehicleDocument extends Document {
  plateNumber: string; // Immatriculation
  brand: string; // Marque
  model: string; // Modèle

  type?: string; // Berline, 4x4, utilitaire...
  year?: number;

  // Nouveaux champs "structurels"
  usageType?: VehicleUsageType; // SERVICE / FONCTION / ...
  energy?: VehicleEnergy; // ESSENCE / DIESEL / ...
  averageConsumption?: number; // L / 100km
  fiscalPower?: number; // CV

  // Propriété / admin
  acquisitionDate?: Date; // Date acquisition
  firstRegistrationDate?: Date; // Date 1ère immat
  ownership?: string; // ex: "ANAC"

  // Compteur km
  currentMileage: number; // Km actuel
  mileageUpdatedAt: Date; // Dernière mise à jour du km

  // Affectation
  assignedToEmployeeMatricule?: string; // ObjectId stringifié
  assignedToName?: string;
  assignedToDirection?: string | null;
  assignedToFunction?: string | null;

  // Notes libres maintenance
  maintenanceNotes?: string;

  dept: string; // ex: "MG"
  status: VehicleStatus;

  createdAt: Date;
  updatedAt: Date;
}
export type VehicleModel = Model<VehicleDocument>;

const VehicleSchema = new Schema<VehicleDocument>(
  {
    plateNumber: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
    },
    brand: {
      type: String,
      required: true,
      trim: true,
    },
    model: {
      type: String,
      required: true,
      trim: true,
    },

    type: {
      type: String,
      trim: true,
    },
    year: {
      type: Number,
      min: 1900,
      max: new Date().getFullYear() + 1,
    },

    // --- Nouveaux champs ---
    usageType: {
      type: String,
      enum: Object.values(VehicleUsageType),
    },
    energy: {
      type: String,
      enum: Object.values(VehicleEnergy),
    },
    averageConsumption: {
      type: Number,
      min: 0,
    },
    fiscalPower: {
      type: Number,
      min: 0,
    },

    acquisitionDate: {
      type: Date,
    },
    firstRegistrationDate: {
      type: Date,
    },
    ownership: {
      type: String,
      trim: true,
    },

    currentMileage: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    mileageUpdatedAt: {
      type: Date,
      required: true,
      default: Date.now,
    },

    // Affectation
    assignedToEmployeeMatricule: {
      type: String,
      trim: true,
      index: true,
    },
    assignedToName: {
      type: String,
      trim: true,
    },
    assignedToDirection: {
      type: String,
      trim: true,
    },
    assignedToFunction: { type: String, trim: true },

    maintenanceNotes: {
      type: String,
      trim: true,
    },

    dept: {
      type: String,
      required: true,
      default: "MG",
      index: true,
    },

    status: {
      type: String,
      enum: Object.values(VehicleStatus),
      default: VehicleStatus.ACTIVE,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "vehicles",
  }
);

// Immatriculation unique par département
VehicleSchema.index({ dept: 1, plateNumber: 1 }, { unique: true });

// JSON propre
VehicleSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const Vehicle = MongoModel<VehicleDocument, VehicleModel>(
  "Vehicle",
  VehicleSchema
);
