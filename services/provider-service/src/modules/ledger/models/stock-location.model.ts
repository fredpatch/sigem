// stock-location.model.ts
import { Schema, model } from "mongoose";

const StockLocationSchema = new Schema(
  {
    name: { type: String, required: true },
    active: { type: Boolean, default: true },

    // optionnel si MG est multi-direction / multi-entité
    orgId: { type: Schema.Types.ObjectId, index: true, required: false },
  },
  { timestamps: true },
);

// recherche simple
StockLocationSchema.index({ name: "text" });
StockLocationSchema.index({ orgId: 1, name: 1 }, { unique: true });

export const StockLocationModel = model("StockLocation", StockLocationSchema);
