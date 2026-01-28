import { Schema, model, Types } from "mongoose";

export interface SupplierPriceDoc {
  supplierId: Types.ObjectId;
  itemId: Types.ObjectId;
  unitPrice: number;
  currency: "XAF";
  source?: {
    docId?: string;
    note?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SupplierPriceSchema = new Schema<SupplierPriceDoc>(
  {
    supplierId: { type: Schema.Types.ObjectId, required: true, index: true },
    itemId: { type: Schema.Types.ObjectId, required: true, index: true },
    unitPrice: { type: Number, required: true, min: 0 },
    currency: { type: String, enum: ["XAF"], default: "XAF" },
    source: {
      docId: { type: String },
      note: { type: String },
    },
  },
  { timestamps: true },
);

// unique compound index
SupplierPriceSchema.index({ supplierId: 1, itemId: 1 }, { unique: true });

export const SupplierPriceEntity = model<SupplierPriceDoc>(
  "SupplierPrice",
  SupplierPriceSchema,
);
