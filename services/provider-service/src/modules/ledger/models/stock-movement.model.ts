// stock-movement.model.ts
import { Schema, model, Types } from "mongoose";

export type StockMovementType = "IN" | "OUT" | "ADJUST";

const StockMovementSchema = new Schema(
  {
    type: {
      type: String,
      enum: ["IN", "OUT", "ADJUST"],
      required: true,
    },

    supplyItemId: { type: Types.ObjectId, ref: "SupplyItem", required: true },
    locationId: {
      type: Types.ObjectId,
      ref: "StockLocation",
      required: true,
    },

    // delta signé : +10 / -5 / +2 / -3
    delta: { type: Number, required: true },

    // info métier
    qty: { type: Number }, // utile pour IN / OUT (toujours positif)
    unitCost: { type: Number },
    providerId: { type: Types.ObjectId, ref: "Provider" },

    // référence métier (appro, réception, manuel)
    refType: { type: String }, // SUPPLY_PLAN | RECEPTION | MANUAL
    refId: { type: Types.ObjectId },

    reason: { type: String },

    stockBefore: { type: Number, required: true },
    stockAfter: { type: Number, required: true },

    createdBy: { type: Types.ObjectId, ref: "User" },
    orgId: { type: Types.ObjectId, index: true },
  },
  { timestamps: true },
);

// filtres fréquents
StockMovementSchema.index({ supplyItemId: 1, createdAt: -1 });
// StockMovementSchema.index({ locationId: 1, createdAt: -1 });
StockMovementSchema.index({ locationId: 1, createdAt: -1, type: 1 });
StockMovementSchema.index({
  locationId: 1,
  supplyItemId: 1,
  type: 1,
  createdAt: -1,
});
StockMovementSchema.index({ type: 1, createdAt: -1 });

// recherche texte MG-friendly
StockMovementSchema.index({
  reason: "text",
  refType: "text",
});

export const StockMovementModel = model("StockMovement", StockMovementSchema);
