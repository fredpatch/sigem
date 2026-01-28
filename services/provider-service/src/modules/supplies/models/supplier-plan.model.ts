import { Schema, model, Types } from "mongoose";

export type SupplyPlanStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "WAITING_QUOTE"
  | "WAITING_INVOICE"
  | "ORDERED"
  | "DELIVERED"
  | "COMPLETED"
  | "CANCELLED";

export interface SupplyPlanLine {
  itemId: Types.ObjectId;
  labelSnapshot: string;
  unitSnapshot?: string | null;
  quantity: number;
  selectedSupplierId?: Types.ObjectId | null;
  selectedUnitPrice?: number | null;
  currency?: "XAF";
  lineTotal: number;
}

export interface SupplyPlanHistoryEntry {
  at: Date;
  byUserId: string;
  from: SupplyPlanStatus;
  to: SupplyPlanStatus;
  note?: string;
}

export interface SupplyPlanDoc {
  reference: string;
  status: SupplyPlanStatus;
  scheduledFor?: Date | null;

  department?: string | null;
  createdByUserId: string;

  lines: SupplyPlanLine[];
  estimatedTotal: number;
  currency: "XAF";

  attachments: Array<{
    type: "QUOTE" | "INVOICE" | "OTHER";
    name: string;
    url: string;
    uploadedAt: Date;
  }>;

  history: SupplyPlanHistoryEntry[];
  notes?: string | null;

  createdAt: Date;
  updatedAt: Date;
}

const SupplyPlanLineSchema = new Schema<SupplyPlanLine>(
  {
    itemId: { type: Schema.Types.ObjectId, required: true },
    labelSnapshot: { type: String, required: true, trim: true },
    unitSnapshot: { type: String, default: null },

    quantity: { type: Number, required: true, min: 0 },

    selectedSupplierId: { type: Schema.Types.ObjectId, default: null },
    selectedUnitPrice: { type: Number, default: null, min: 0 },
    currency: { type: String, enum: ["XAF"], default: "XAF" },

    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false },
);

const SupplyPlanHistorySchema = new Schema<SupplyPlanHistoryEntry>(
  {
    at: { type: Date, required: true },
    byUserId: { type: String, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
    note: { type: String },
  },
  { _id: false },
);

const SupplyPlanSchema = new Schema<SupplyPlanDoc>(
  {
    reference: { type: String, required: true, unique: true, index: true },
    status: {
      type: String,
      required: true,
      enum: [
        "DRAFT",
        "SCHEDULED",
        "WAITING_QUOTE",
        "WAITING_INVOICE",
        "ORDERED",
        "DELIVERED",
        "COMPLETED",
        "CANCELLED",
      ],
      default: "DRAFT",
      index: true,
    },
    scheduledFor: { type: Date, default: null },

    department: { type: String, default: null },
    createdByUserId: { type: String, required: true },

    lines: { type: [SupplyPlanLineSchema], default: [] },

    estimatedTotal: { type: Number, required: true, min: 0, default: 0 },
    currency: { type: String, enum: ["XAF"], default: "XAF" },

    attachments: {
      type: [
        new Schema(
          {
            type: {
              type: String,
              enum: ["QUOTE", "INVOICE", "OTHER"],
              required: true,
            },
            name: { type: String, required: true },
            url: { type: String, required: true },
            uploadedAt: { type: Date, required: true },
          },
          { _id: false },
        ),
      ],
      default: [],
    },

    history: { type: [SupplyPlanHistorySchema], default: [] },
    notes: { type: String, default: null },
  },
  { timestamps: true },
);

// recalcul totals automatically
SupplyPlanSchema.pre("validate", function (next) {
  // @ts-ignore
  const doc = this as SupplyPlanDoc;

  let total = 0;

  doc.lines = (doc.lines || []).map((l) => {
    const q = Number(l.quantity ?? 0);
    const p = l.selectedUnitPrice == null ? 0 : Number(l.selectedUnitPrice);
    const lineTotal = Math.max(0, q) * Math.max(0, p);

    total += lineTotal;

    return {
      ...l,
      quantity: Math.max(0, q),
      selectedUnitPrice: l.selectedUnitPrice == null ? null : Math.max(0, p),
      lineTotal,
      currency: "XAF",
    };
  });

  doc.estimatedTotal = total;
  doc.currency = "XAF";

  next();
});

export const SupplyPlanEntity = model<SupplyPlanDoc>(
  "SupplyPlan",
  SupplyPlanSchema,
);
