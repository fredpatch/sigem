import { Document, model, Schema, Types } from "mongoose";
import { generateUniqueCode, slugify } from "../utils/generate-unique-code";

export type ProductType = "CONSUMABLE" | "MOBILIER" | "EQUIPEMENT" | "AUTRE";

export interface ProductDoc extends Document<Types.ObjectId> {
  label: string;
  code: string; // SKU généré
  type: ProductType;

  categoryId?: Types.ObjectId; // si tu veux lier à Category
  unit?: string; // PIECE, CARTON, LOT... (string pour rester flexible)
  tags: string[];

  dept?: string;
  isActive: boolean;

  searchText: string;

  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<ProductDoc>(
  {
    label: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, index: true },

    type: {
      type: String,
      enum: ["CONSUMABLE", "MOBILIER", "EQUIPEMENT", "AUTRE"],
      required: true,
      index: true,
    },

    categoryId: { type: Schema.Types.ObjectId, ref: "Category", index: true },

    unit: { type: String, trim: true },
    tags: { type: [String], default: [] },

    dept: { type: String, trim: true, index: true },
    isActive: { type: Boolean, default: true, index: true },

    searchText: { type: String, default: "", index: true },
  },
  { timestamps: true }
);

ProductSchema.pre("validate", async function (next) {
  const doc = this as ProductDoc;

  doc.label = doc.label?.trim();

  // tags normalisés
  doc.tags = (doc.tags ?? [])
    .map((t) => String(t).trim().toLowerCase())
    .filter(Boolean);

  if (doc.unit) doc.unit = String(doc.unit).trim();

  // Génération auto du code si non fourni
  if (!doc.code) {
    const base = slugify(doc.label);
    doc.code = await generateUniqueCode("Product", base);
  } else {
    doc.code = String(doc.code).trim().toUpperCase();
  }

  // searchText comme Provider
  const parts = [
    doc.label,
    doc.code,
    doc.type,
    doc.unit,
    doc.dept,
    ...(doc.tags ?? []),
  ].filter(Boolean);

  doc.searchText = parts.join(" ").toLowerCase();

  next();
});

// JSON propre
ProductSchema.set("toJSON", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

ProductSchema.set("toObject", {
  virtuals: true,
  versionKey: false,
  transform: (_doc, ret: any) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

export const ProductModel = model<ProductDoc>("Product", ProductSchema);
