// src/modules/supplies/models/supply-item.model.ts
import mongoose, { Schema, InferSchemaType, model } from "mongoose";
import { normalizeLabel } from "../supply.helpers";
import { SupplyItem } from "../../../types/supply-item";

export const SUPPLY_UNITS = [
  "UNIT",
  "PACK",
  "BOX",
  "CARTON",
  "BOTTLE",
  "REAM",
] as const;

const SupplyItemSchema = new Schema<SupplyItem>(
  {
    label: { type: String, required: true, trim: true },
    labelNormalized: {
      type: String,
      required: true,
      index: true,
      unique: true,
    },
    unit: {
      type: String,
      enum: ["UNIT", "PACK", "BOX", "CARTON", "BOTTLE", "REAM"],
      default: "UNIT",
    },
    active: { type: Boolean, default: true },
  },
  { timestamps: true },
);

SupplyItemSchema.pre("validate", function (next) {
  const doc = this as any;
  doc.labelNormalized = normalizeLabel(doc.label);
  next();
});

// SupplyItemSchema.pre("validate", function (next) {
//   // @ts-ignore
//   this.label = (this.label || "").trim();
//   // @ts-ignore
//   this.labelNormalized = normalizeLabel(this.label);
//   next();
// });

export const SupplyItemEntity = model<SupplyItem>(
  "SupplyItem",
  SupplyItemSchema,
);
