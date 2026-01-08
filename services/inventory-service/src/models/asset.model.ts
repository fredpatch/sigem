// Asset.ts
import { Schema, model, Types } from "mongoose";
import { buildAssetCode } from "../services/code.service";

export enum AssetSituation {
  NEUF = "NEUF",
  EN_SERVICE = "EN_SERVICE",
  EN_PANNE = "EN_PANNE",
  HORS_SERVICE = "HORS_SERVICE",
  REFORME = "REFORME",
}

const AssetSchema = new Schema(
  {
    code: { type: String, unique: true, required: true }, // sera auto-renseigné si absent
    label: { type: String, required: true }, // ex: "Ordinateur complet" (ou plus précis)
    categoryId: { type: Types.ObjectId, ref: "Category", required: true },
    locationId: { type: Types.ObjectId, ref: "Location", required: true },

    // Métadonnées (optionnelles mais utiles)
    serialNumber: { type: String },
    brand: { type: String },
    model: { type: String },
    quantity: { type: Number, default: 1 }, // utile pour consommables
    unit: { type: String, default: "pcs" },

    prefix: { type: String, index: true },
    sequence: { type: Number },

    isDeleted: { type: Boolean, default: false },
    isRestored: { type: Boolean, default: false },

    situation: {
      type: String,
      enum: Object.values(AssetSituation),
      default: AssetSituation.EN_SERVICE,
    },
    observation: { type: String }, // “SITUATION / OBSERVATION” du tableau
    attributes: { type: Schema.Types.Mixed }, // extensible (RAM, CPU, etc.)
  },
  { timestamps: true }
);

AssetSchema.index({ categoryId: 1, locationId: 1 });

// Auto-code: F (Famille) + B (code Batiment) + S (Sous cat) + "NNN"
AssetSchema.pre("validate", async function (next) {
  const doc = this as any;
  try {
    if (!doc.code) {
      const sess = doc.$session?.()

      const res = await buildAssetCode(
        doc.categoryId,
        doc.locationId,
        undefined,
        doc.label,
        sess
      );

      if (!res?.code) {
        return next(new Error("Code generation failed"));
      }

      doc.prefix = res.prefix;
      doc.sequence = res.sequence;
      doc.code = res.code;
    }
    next();
  } catch (err) {
    console.error("[pre:validate] error", err);
    next(err as any);
  }
});

export const Asset = model("Asset", AssetSchema);
