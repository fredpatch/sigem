import { Document, model, Schema, Types } from "mongoose";
import type { ProductType } from "./product.model";

export interface PurchaseRequestLineDoc extends Document<Types.ObjectId> {
  requestId: Types.ObjectId;
  productId: Types.ObjectId;

  // snapshot produit
  labelSnapshot: string;
  codeSnapshot: string;
  typeSnapshot: ProductType;
  unitSnapshot?: string;

  quantity: number;

  // estimation basée sur catalogue (optionnel mais utile)
  unitPriceEstimated?: number;
  lineTotalEstimated: number;

  notes?: string;

  createdAt: Date;
  updatedAt: Date;
}

const PurchaseRequestLineSchema = new Schema<PurchaseRequestLineDoc>(
  {
    requestId: {
      type: Schema.Types.ObjectId,
      ref: "PurchaseRequest",
      required: true,
      index: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      index: true,
    },

    labelSnapshot: { type: String, required: true, trim: true },
    codeSnapshot: { type: String, required: true, trim: true },
    typeSnapshot: {
      type: String,
      enum: ["CONSUMABLE", "MOBILIER", "EQUIPEMENT", "AUTRE"],
      required: true,
      index: true,
    },
    unitSnapshot: { type: String, trim: true },

    quantity: { type: Number, required: true, min: 0 },

    unitPriceEstimated: { type: Number, min: 0 },
    lineTotalEstimated: { type: Number, default: 0 },

    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

PurchaseRequestLineSchema.pre("save", function (next) {
  const doc = this as PurchaseRequestLineDoc;

  const qty = Number(doc.quantity ?? 0);
  doc.quantity = Number.isFinite(qty) ? qty : 0;

  const up = Number(doc.unitPriceEstimated ?? 0);
  doc.unitPriceEstimated = Number.isFinite(up) ? up : 0;

  doc.lineTotalEstimated = Math.round(
    (doc.unitPriceEstimated ?? 0) * doc.quantity
  );

  if (doc.notes) doc.notes = String(doc.notes).trim();

  next();
});

PurchaseRequestLineSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const PurchaseRequestLineModel = model<PurchaseRequestLineDoc>(
  "PurchaseRequestLine",
  PurchaseRequestLineSchema
);
