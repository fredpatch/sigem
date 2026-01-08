// Category.ts
import { Schema, model, Types } from "mongoose";

export enum CategoryFamily {
  EQUIPEMENT = "EQUIPEMENT",
  INFORMATIQUE = "INFORMATIQUE",
  MOBILIER = "MOBILIER",
}

const CategorySchema = new Schema(
  {
    code: { type: String, unique: true, required: true }, // ex: "IAC"
    label: { type: String, required: true }, // ex: "Ordinateur complet"
    family: {
      type: String,
      enum: Object.values(CategoryFamily),
      required: true,
    },
    parentId: { type: Types.ObjectId, ref: "Category", default: null }, // null = famille
    canonicalPrefix: { type: String, required: true }, // ex: "IAC"
    description: { type: String },
    allowedChildren: [{ type: Types.ObjectId, ref: "Category" }],
  },
  { timestamps: true }
);

// CategorySchema.index({ code: 1 }, { unique: true });
CategorySchema.index({ parentId: 1, canonicalPrefix: 1 }, { unique: true, sparse: true });
CategorySchema.index({ family: 1, label: 1 }, { unique: true });

const upper = (s?: string) => (s ?? "").toUpperCase().trim();
const famInitial = (f: CategoryFamily) => (f ? f.charAt(0) : ""); // E|I|M

function subcatShortFromLabel(label?: string, maxLen = 2): string {
  const s = upper(label)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/g, " ")
    .trim();

  if (!s) return "";

  const words = s.split(" ").filter(Boolean);

  if (words.length > 1) {
    return words.map((w) => w[0]).join("").slice(0, maxLen).padEnd(maxLen, "X");
  }

  const w = words[0];
  if (w.length === 1) return (w + "X").slice(0, maxLen);
  if (maxLen === 1) return w[0];

  return (w[0] + w[w.length - 1]).slice(0, maxLen);
}

// Auto-fill code & canonicalPrefix
CategorySchema.pre("validate", async function (next) {
  const doc = this as any;

  try {
    if (doc.parentId) {
      const parent = await Category.findById(doc.parentId)
        .select("family")
        .lean();

      if (parent?.family) {
        doc.family = parent.family;
      } else if (!doc.family) {
        doc.family = "INFORMATIQUE";
      }
    }

    const F = famInitial(doc.family); // "E" | "I" | "M"

    if (!doc.parentId) {
      doc.code = doc.code || F;
      doc.canonicalPrefix = doc.canonicalPrefix || F;
    } else {
      const S2 = subcatShortFromLabel(doc.label, 2);

      doc.canonicalPrefix = doc.canonicalPrefix || S2;

      const CODE = `${F}${S2}`;
      doc.code = doc.code || CODE;
    }

    // Normalize to uppercase
    doc.code = upper(doc.code);
    doc.canonicalPrefix = upper(doc.canonicalPrefix);
    next();
  } catch (error) {
    next(error as any);
  }
});

export const Category = model("Category", CategorySchema);
