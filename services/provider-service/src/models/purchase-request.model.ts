import { Document, model, Schema, Types } from "mongoose";

export type PurchaseRequestStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "APPROVED"
  | "REJECTED"
  | "ORDERED"
  | "RECEIVED"
  | "CANCELLED"
  | "CONVERTED";

export interface PurchaseRequestDoc extends Document<Types.ObjectId> {
  dept?: string;

  title: string; // ex: "Besoin mobilier - Jan 2026"
  reference?: string; // ex: BR-2026-0001 (optionnel)
  status: PurchaseRequestStatus;

  // optionnel : fournisseur pressenti
  providerId?: Types.ObjectId;

  neededAt?: Date;
  notes?: string;
  tags: string[];

  subtotalEstimated: number; // somme estimée (unitPriceEstimated*qty)
  currency: string; // XAF

  searchText: string;

  requestedBy?: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  approvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const PurchaseRequestSchema = new Schema<PurchaseRequestDoc>(
  {
    dept: { type: String, trim: true, index: true },

    title: { type: String, required: true, trim: true },
    reference: { type: String, trim: true, index: true },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "SUBMITTED",
        "APPROVED",
        "REJECTED",
        "ORDERED",
        "RECEIVED",
        "CANCELLED",
        "CONVERTED",
      ],
      default: "DRAFT",
      index: true,
    },

    providerId: { type: Schema.Types.ObjectId, ref: "Provider", index: true },

    neededAt: { type: Date },
    notes: { type: String, trim: true },
    tags: { type: [String], default: [] },

    subtotalEstimated: { type: Number, default: 0 },
    currency: { type: String, default: "XAF", trim: true },

    searchText: { type: String, default: "", index: true },

    requestedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    approvedAt: { type: Date },
  },
  { timestamps: true }
);

PurchaseRequestSchema.pre("save", function (next) {
  const doc = this as PurchaseRequestDoc;

  doc.title = doc.title?.trim();
  if (doc.reference) doc.reference = String(doc.reference).trim();
  if (doc.notes) doc.notes = String(doc.notes).trim();

  doc.tags = (doc.tags ?? [])
    .map((t) => String(t).trim().toLowerCase())
    .filter(Boolean);

  const parts = [
    doc.title,
    doc.reference,
    doc.status,
    doc.dept,
    doc.currency,
    ...(doc.tags ?? []),
  ].filter(Boolean);

  doc.searchText = parts.join(" ").toLowerCase();

  next();
});

PurchaseRequestSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const PurchaseRequestModel = model<PurchaseRequestDoc>(
  "PurchaseRequest",
  PurchaseRequestSchema
);
