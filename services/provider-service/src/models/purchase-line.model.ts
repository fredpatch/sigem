import { Document, model, Schema, Types } from "mongoose";
import type { ProductType } from "./product.model";

export interface PurchaseLineDoc extends Document<Types.ObjectId> {
  purchaseId: Types.ObjectId;

  productId: Types.ObjectId;

  // snapshot pour audit / historique
  labelSnapshot: string;
  codeSnapshot: string;
  typeSnapshot: ProductType;
  unitSnapshot?: string;

  unitPrice: number;
  quantity: number;
  lineTotal: number;

  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseLineSchema = new Schema<PurchaseLineDoc>(
  {
    purchaseId: {
      type: Schema.Types.ObjectId,
      ref: "Purchase",
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

    unitPrice: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, default: 0 },

    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

PurchaseLineSchema.pre("save", function (next) {
  const doc = this as PurchaseLineDoc;

  const up = Number(doc.unitPrice ?? 0);
  const qty = Number(doc.quantity ?? 0);
  doc.unitPrice = Number.isFinite(up) ? up : 0;
  doc.quantity = Number.isFinite(qty) ? qty : 0;
  doc.lineTotal = Math.round(doc.unitPrice * doc.quantity);

  if (doc.notes) doc.notes = String(doc.notes).trim();

  next();
});

PurchaseLineSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const PurchaseLineModel = model<PurchaseLineDoc>(
  "PurchaseLine",
  PurchaseLineSchema
);
