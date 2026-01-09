import { Document, model, Schema, Types } from "mongoose";

export type PurchaseStatus = "DRAFT" | "CONFIRMED" | "CANCELLED";

export interface PurchaseDoc extends Document<Types.ObjectId> {
  providerId: Types.ObjectId;

  date: Date;
  reference?: string; // N° facture / BL / bon
  status: PurchaseStatus;

  currency: string; // "XAF"
  dept?: string;

  notes?: string;
  tags: string[];

  subtotal: number; // somme des lignes
  total: number; // subtotal - discount + tax (si utilisé)
  tax?: number;
  discount?: number;

  searchText: string;

  createdBy?: Types.ObjectId; // optionnel si vous trackez l'user
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseSchema = new Schema<PurchaseDoc>(
  {
    providerId: {
      type: Schema.Types.ObjectId,
      ref: "Provider",
      required: true,
      index: true,
    },

    date: { type: Date, required: true, index: true },
    reference: { type: String, trim: true, index: true },

    status: {
      type: String,
      enum: ["DRAFT", "CONFIRMED", "CANCELLED"],
      default: "CONFIRMED",
      index: true,
    },

    currency: { type: String, default: "XAF", trim: true },
    dept: { type: String, trim: true, index: true },

    notes: { type: String, trim: true },
    tags: { type: [String], default: [] },

    subtotal: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },

    searchText: { type: String, default: "", index: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

PurchaseSchema.pre("save", function (next) {
  const doc = this as PurchaseDoc;

  if (doc.reference) doc.reference = String(doc.reference).trim();
  if (doc.notes) doc.notes = String(doc.notes).trim();

  doc.tags = (doc.tags ?? [])
    .map((t) => String(t).trim().toLowerCase())
    .filter(Boolean);

  // searchText (pratique pour filtre simple)
  const parts = [
    doc.reference,
    doc.currency,
    doc.status,
    doc.dept,
    ...(doc.tags ?? []),
  ].filter(Boolean);

  doc.searchText = parts.join(" ").toLowerCase();

  next();
});

PurchaseSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

PurchaseSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const PurchaseModel = model<PurchaseDoc>("Purchase", PurchaseSchema);
