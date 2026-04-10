// stock-item.model.ts
import { Schema, model } from "mongoose";

const StockItemSchema = new Schema(
  {
    supplyItemId: {
      type: Schema.Types.ObjectId,
      ref: "SupplyItem",
      required: true,
    },
    locationId: {
      type: Schema.Types.ObjectId,
      ref: "StockLocation",
      required: true,
    },

    onHand: { type: Number, default: 0 },
    minLevel: { type: Number, default: 0 },

    orgId: { type: Schema.Types.ObjectId, index: true, required: false },
  },
  { timestamps: true },
);

// un article ne peut exister qu’une fois par location
StockItemSchema.index(
  { orgId: 1, locationId: 1, supplyItemId: 1 },
  { unique: true },
);

// index pratique pour listes / alertes
StockItemSchema.index({ onHand: 1 });
StockItemSchema.index({ minLevel: 1 });

export const StockItemModel = model("StockItem", StockItemSchema);
