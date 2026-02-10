// stock-location.model.ts
import { Schema, model, Types } from "mongoose";

const StockLocationSchema = new Schema(
  {
    name: { type: String, required: true },
    active: { type: Boolean, default: true },

    // optionnel si MG est multi-direction / multi-entité
    orgId: { type: Types.ObjectId, index: true, required: false },
  },
  { timestamps: true },
);

// recherche simple
StockLocationSchema.index({ name: "text" });

export const StockLocationModel = model("StockLocation", StockLocationSchema);
